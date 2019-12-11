from flask import Flask, request, abort, jsonify
from flask_cors import CORS
from web3 import Web3,HTTPProvider,IPCProvider,WebsocketProvider
from threading import Thread
import requests
from requests.models import Response
from bson.json_util import dumps
import time
import datetime
import json
from pymongo import MongoClient
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import bs4
import re
from dotenv import load_dotenv
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration

load_dotenv()

username = os.getenv('ATLASUSER')
password = os.getenv('ATLASPASS')
isProd = os.getenv('ENVIRONMENT') == "production"
sendGridKey = os.getenv('SENDGRIDAPIKEY')
congoEmail = "Congo-Exchange@no-reply.io"
NETWORK_ID="3"
BASE_URL = "https://congo-frontend.herokuapp.com"
ORDERS_URL = BASE_URL + "/user/orders"
LISTINGS_URL = BASE_URL + "/listing/"
SENDGRID_TRANSACTIONAL_TEMPLATE_ID = "d-3119602fe60149fa846693a319301110"

allStatuses = ["Paid","Processing","Shipped","Complete","Exception"]
statusToEmoji = ["💸","🏭","🚚💨","📦", "⛔"]

client = MongoClient("mongodb+srv://"+username+":"+password+"@cluster0-zaima.mongodb.net/test?retryWrites=true&w=majority&ssl_cert_reqs=CERT_NONE")
products = client.Congo.products
orders = client.Congo.orders

if (isProd):
    sentry_sdk.init(
        dsn=os.getenv('SENTRYDSN'),
        integrations=[FlaskIntegration()]
    )


app=Flask(__name__)
CORS(app)

if (isProd):
    w3=Web3(WebsocketProvider('wss://ropsten.infura.io/ws'))
    with open("./contract.json") as f:
        info_json = json.load(f)
        CONTRACT_ADDRESS = info_json["networks"][NETWORK_ID]["address"]
        print(CONTRACT_ADDRESS)
        congo_abi = info_json["abi"]
else:
    print("DEVELOPMENT MODE")
    CONTRACT_ADDRESS='0x6BDA1B6D18CBda0D093DE85327262960213A35a2'
    w3=Web3(HTTPProvider('http://localhost:7545'))
    with open("../contracts/contracts/build/contracts/Congo.json") as f:
        info_json = json.load(f)
        congo_abi = info_json["abi"]

def getContract():
    print("getting contract..")
    contract = None
    try:
        contract=w3.eth.contract(address=CONTRACT_ADDRESS,abi=congo_abi)
    except requests.exceptions.ConnectionError(request=request):
        print("sleeping for a bit..")
        time.sleep(10)
        return getContract()
    return contract

#Email Confirmation Service
def sendEmail(toEmail,sub,content):
    message = Mail(
        from_email=congoEmail,
        to_emails=toEmail,  
    )
    message.dynamic_template_data = {
        'order': content
    }
    message.template_id = SENDGRID_TRANSACTIONAL_TEMPLATE_ID
    print("[SendGrid Attempt]: From: %s To: %s Subject: %s" %(congoEmail,toEmail,sub))
    try:
        sg = SendGridAPIClient(sendGridKey)
        response = sg.send(message)
        if (response.status_code == 202):
            print("[SendGrid Success]: From: %s To: %s Subject: %s" %(congoEmail,toEmail,sub))
        else:
            print("[SendGrid Failed]: From: %s To: %s Subject: %s with Status Code: %d" %(congoEmail,toEmail,sub,response.status_code))
    except Exception as e:
        print("[SendGrid Failed]: From: %s To: %s Subject: %s" %(congoEmail,toEmail,sub))
        print(e)

def putNewProduct(event):
    newProduct = dict(event['args'])
    # print(newProduct)
    print("creating new listing with id: ",newProduct['id'])
    #add ts
    newProduct['listingTimestamp'] = datetime.datetime.utcnow()
    print(newProduct)
    products.insert_one(newProduct)

def updateListing(event):
    # find an listing
    updatedListing = dict(event['args'])
    print("updating listing id: ",updatedListing['id'])
    products.update_one({'id': updatedListing['id']},{
        "$set": {
            "quantity": updatedListing['quantity'],
            "price": updatedListing['price'],
            "details": updatedListing['details'],
            "name": updatedListing['name'],
            "sellerContactDetails": updatedListing['sellerContactDetails'],
            "lastUpdatedTimestamp": datetime.datetime.utcnow()
        }
    })

def putNewOrder(event):    
    newOrder = dict(event['args'])
    newOrder['listingTimestamp'] = str(datetime.datetime.utcnow())
    orders.insert_one(newOrder)
    print("created new order with id:",newOrder['orderID'])

    #fetch image link to attach to obj in order to generate email body
    prodListing = products.find_one({"id": newOrder['prodID']})
    newOrder['imageLink'] = prodListing['imageLink'] if prodListing is not None else "" # default no pic
    del newOrder['_id']
    newOrder['congoType'] = ("%s It's time to ship a new order!"% statusToEmoji[newOrder['orderStatus']])
    seller_content = generateNewOrderEmail(newOrder,False)
    sendEmail(newOrder['sellerContactDetails'],newOrder['congoType'],seller_content)
    newOrder['congoType'] = ("%s Your order was successfully created!"% statusToEmoji[newOrder['orderStatus']])
    buyer_content = generateNewOrderEmail(newOrder,True)
    sendEmail(newOrder['buyerContactDetails'],newOrder['congoType'],buyer_content)

def updateOrder(event):
    updatedOrder = dict(event['args'])
    print("updating order with id: ",updatedOrder['orderID'])
    orders.update_one({'orderID': updatedOrder['orderID']},{
        "$set": {
            "orderStatus": updatedOrder['orderStatus'],
            'lastUpdatedTimestamp': str(datetime.datetime.utcnow())
        }
    })

    res = orders.find_one({"orderID": updatedOrder['orderID']})
    if res is None:
        print("[Update Order]: Order id %d was not found" %updatedOrder['orderID'])
        return
    #fetch image from products to send out email.
    prodListing = products.find_one({"id": res['prodID']})
    res['imageLink'] = prodListing['imageLink'] if prodListing is not None else "" # default no pic
    orderLoaded = dumpThenLoad(res)
    del res['_id']
    res['congoType'] = ("%s Your order has updated!" % statusToEmoji[int(res['orderStatus'])])
    buyer_content = generateNewOrderEmail(res,True)
    sendEmail(orderLoaded['buyerContactDetails'],res['congoType'],buyer_content)
    seller_content = generateNewOrderEmail(res,False)
    sendEmail(orderLoaded['sellerContactDetails'],res['congoType'],seller_content)


def generateNewOrderEmail(order,isBuyer):
    some_order = dict(order)
    #Shortening Eth Addresses
    formattedSellerAddress = "%s...%s" %(some_order['sellerAddress'][:6],some_order['sellerAddress'][-4:])
    formattedBuyerAddress = "%s...%s" %(some_order['buyerAddress'][:6],some_order['buyerAddress'][-4:])
    etherScanAddress = "ropsten.etherscan.io/address/" if NETWORK_ID == "3" else "etherscan.io/address/"
    etherScanBuyerLink = etherScanAddress + some_order['buyerAddress']
    etherScanSellerLink = etherScanAddress + some_order['sellerAddress']
    #formatting wei to eth
    ethTotal = float(some_order['total']) / 10**18
    ethPrice = (float(some_order['total']) / float(some_order['quantity'])) / 10**18
    # modify order obj to send to email template
    some_order['emailSummary'] = ("Order #%s Status Update: %s" %(some_order['orderID'],allStatuses[some_order['orderStatus']]))
    some_order['total'] = float('%.15f' % (ethTotal))
    some_order['isBuyer'] = isBuyer
    some_order['buyerLink'] = etherScanBuyerLink
    some_order['sellerLink'] = etherScanSellerLink
    some_order['price'] = float('%.15f' %(ethPrice))
    some_order['link'] = LISTINGS_URL + str(some_order['prodID'])
    some_order['buyerAddress'] = formattedBuyerAddress
    some_order['sellerAddress'] = formattedSellerAddress
    some_order['orderStatus'] = allStatuses[some_order['orderStatus']]
    print(some_order)
    return some_order

def eventMap(filters,poll_interval):
    print("started worker thread!")
    while True:
        # check all filters for new events and then sleep
        for key in filters:
            if(key == "productListed"):
                for event in filters[key].get_new_entries():
                    putNewProduct(event)
            elif(key == "listingUpdated"):
                for event in filters[key].get_new_entries():
                    updateListing(event)
            elif(key == "orderCreated"):
                for event in filters[key].get_new_entries():
                    putNewOrder(event)
            elif(key == "orderUpdated"):
                for event in filters[key].get_new_entries():
                    updateOrder(event)
        time.sleep(poll_interval)

def dumpThenLoad(item):
    dump = dumps(item)
    return json.loads(dump)

# returns first listing with a matching id
def queryListingById(id):
    listing = products.find_one({"id": int(id)})
    return dumpThenLoad(listing)
    

# returns all listings by name
def queryListingsByName(name):
    regx = re.compile(name, re.I)
    productResults = products.find({"name": regx, "quantity": {"$gt": 0}}).limit(20)
    return list(map(dumpThenLoad, list(productResults)))
    
# returns all listings by owner
def queryListingsByOwner(owner):
    productResults = products.find({"owner":owner})
    return list(map(dumpThenLoad, list(productResults)))

# returns all orders by buyer
def queryListingsByBuyer(buyer):
    orderResults = orders.find({"buyerAddress":buyer}, {"_id": 0, "prodID": 1})
    ids = list( dict.fromkeys(map(lambda order: order["prodID"], list(orderResults))) )
    productResults = products.find({"id":{"$in": ids}})
    return list(map(dumpThenLoad, list(productResults)))

# returns all orders by buyer
def queryOrdersByBuyer(prodID, buyer):
    orderResults = orders.find({"buyerAddress":buyer, "prodID": int(prodID)})
    return list(map(dumpThenLoad, list(orderResults)))

# returns all orders by buyer
def queryOrdersBySeller(prodID, seller):
    orderResults = orders.find({"sellerAddress":seller, "prodID": int(prodID)})
    return list(map(dumpThenLoad, list(orderResults)))

def startWorkers():
    filters = {
        "productListed" :contract.events.listingCreated.createFilter(fromBlock='latest'),
        "listingUpdated":contract.events.listingUpdated.createFilter(fromBlock='latest'),
        "orderCreated":contract.events.orderCreated.createFilter(fromBlock='latest'),  
        "orderUpdated":contract.events.orderUpdated.createFilter(fromBlock='latest')
    }
    worker=Thread(target=eventMap,args=(filters,5),daemon=True)
    worker.start()

@app.route('/')
def hello_world():
    return 'Welcome to the backend!'

# get listing by id
@app.route('/listing/<listingId>')
def getListing(listingId):
    address = request.args.get('address')
    if listingId is not None:
        return jsonify({
            "listing": queryListingById(listingId),
            "ordersBought": [] if address is None else queryOrdersByBuyer(listingId, address),
            "ordersSold": [] if address is None else queryOrdersBySeller(listingId, address)
        })
    else:
        return abort(400)

# search listings by name
@app.route('/search')
def search():
    query = request.args.get('query')
    if query is not None:
        return jsonify(
            {"results": queryListingsByName(query)}
        )
    else:
        return abort(400)

# get orders by buyer
@app.route('/user/orders')
def userOrders():
    buyer = request.args.get('buyer') 
    if buyer is not None:
        return jsonify(
            {"listings": queryListingsByBuyer(buyer)}
        )
    else:
        return abort(400)

# get listings by owner
@app.route('/user/listings')
def userListings():
    owner = request.args.get('owner') 
    if owner is not None:
        return jsonify(
            {"listings": queryListingsByOwner(owner)}
        )
    else:
        return abort(400)

contract = getContract()
serverStatusResult = client.Congo.command("serverStatus")
startWorkers()
print("Connected to Mongo Atlas:",serverStatusResult['host'])

if __name__ == '__main__':
    app.run()

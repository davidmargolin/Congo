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
load_dotenv()

username = os.getenv('ATLASUSER')
password = os.getenv('ATLASPASS')
isProd = os.getenv('ENVIRONMENT') == "production"
sendGridKey = os.getenv('SENDGRIDAPIKEY')
congoEmail = "Congo-Exchange@no-reply.io"
NETWORK_ID="3"
BASE_URL = "https://congo-frontend.herokuapp.com"
ORDERS_URL = BASE_URL + "/user/orders"
LISTINGS_URL = BASE_URL + "/user/listing/"

allStatuses = ["Listed","Processing","Shipped","Complete","Exception"]
statusToEmoji = ["✏️","💸","🚚💨","📦", "⛔"]

client = MongoClient("mongodb+srv://"+username+":"+password+"@cluster0-zaima.mongodb.net/test?retryWrites=true&w=majority&ssl_cert_reqs=CERT_NONE")
products = client.Congo.products
orders = client.Congo.orders

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
    except requests.exceptions.ConnectionError(e, request=request):
        print("exception raised",e)
        print("sleeping for a bit..")
        time.sleep(10)
        return getContract()
    return contract

contract = getContract()

#Email Confirmation Service
def sendEmail(toEmail,sub,content):
    message = Mail(
        from_email=congoEmail,
        to_emails=toEmail,
        subject=sub,
        html_content=content
    )
    print("[SendGrid Attempt]: From: %s To: %s Subject: %s" %(congoEmail,toEmail,sub))
    try:
        sg = SendGridAPIClient(sendGridKey)
        response = sg.send(message)
        if (response.status_code == 202):
            print("[SendGrid Success]: From: %s To: %s Subject: %s" %(congoEmail,toEmail,sub))
        else:
            print("[SendGrid Failed]: From: %s To: %s Subject: %s with Status Code: %d" %(congoEmail,toEmail,sub,response.status_code))
    except Exception as e:
        print("[SendGrid Failed]: From: %s To: %s Subject: %s with Status Code: %d" %(congoEmail,toEmail,sub,response.status_code))
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
    if(prodListing is None):
        newOrder['imageLink'] = "" # default no pic
    else:
        newOrder['imageLink'] = prodListing['imageLink'] 
    newOrder['congoType'] = ("%s It's time to ship a new order!"% statusToEmoji[newOrder['orderStatus']])
    seller_content = generateNewOrderEmail(newOrder)
    sendEmail(newOrder['sellerContactDetails'],newOrder['congoType'],seller_content)
    newOrder['congoType'] = ("%s Your order is now processing!"% statusToEmoji[newOrder['orderStatus']])
    buyer_content = generateNewOrderEmail(newOrder)
    sendEmail(newOrder['buyerContactDetails'],newOrder['congoType'],buyer_content)

def updateOrder(event):
    updatedOrder = dict(event['args'])
    print("updating order with id: ",updatedOrder['orderID'])
    orders.update_one({'orderID': updatedOrder['orderID']},{
        "$set": {
            "orderStatus": updatedOrder['orderStatus'],
            'lastUpdatedTimestamp': datetime.datetime.utcnow()
        }
    })

    res = orders.find_one({"orderID": updatedOrder['orderID']})
    if res is None:
        print("[Update Order]: Order id %d was not found" %updatedOrder['orderID'])
        return

    #fetch image from products to send out email.
    prodListing = products.find_one({"id": res['prodID']})
    if(prodListing is None):
        res['imageLink'] = "" # default no pic
    else:
        res['imageLink'] = prodListing['imageLink']

    orderLoaded = dumpThenLoad(res)
    print(orderLoaded)
    res['congoType'] = ("%s Your order has updated!" % statusToEmoji[int(res['orderStatus'])])
    content = generateNewOrderEmail(res)
    sendEmail(orderLoaded['buyerContactDetails'],res['congoType'],content)
    sendEmail(orderLoaded['sellerContactDetails'],res['congoType'],content)

def generateNewOrderEmail(some_order):
    #Setup Email Template
    #load the file
    email = None
    #not sure if its more beneficial to do a deep copy of the template tree
    with open("./email-template.html") as inf:
        template = inf.read()
        email = bs4.BeautifulSoup(template,features="html.parser")
    if email is None:
        print("[Email Service]: Problems opening email template file.")
        return

    formattedSellerAddress = "%s...%s" %(some_order['sellerAddress'][:6],some_order['sellerAddress'][-4:])
    formattedBuyerAddress = "%s...%s" %(some_order['buyerAddress'][:6],some_order['buyerAddress'][-4:])

    etherScanAddress = "etherscan.io/address/" # assume main-net on init
    if NETWORK_ID == "3":
        etherScanAddress = "ropsten.etherscan.io/address/"
    
    etherScanBuyerLink = etherScanAddress + some_order['buyerAddress']
    etherScanSellerLink = etherScanAddress + some_order['sellerAddress']

    #generate a tags
    buyer_a_tag = email.new_tag('a')
    seller_a_tag = email.new_tag('a')
    buyer_a_tag['href'] = etherScanBuyerLink
    seller_a_tag['href'] = etherScanSellerLink
    buyer_a_tag.append(formattedBuyerAddress)
    seller_a_tag.append(formattedSellerAddress)

    #formatting wei to eth
    ethTotal = float(some_order['total']) / 10**18
    ethPrice = (float(some_order['total']) / float(some_order['quantity'])) / 10**18

    email_summary = email.find("span",id="email-summary")
    congo_type = email.find("td",id="congo-type")
    buyer_email = email.find("td",id="buyer-email")
    seller_email = email.find("td",id="seller-email")
    timestamp = email.find("td",id="timestamp")
    order_num = email.find("a",id="order-number")
    quantity = email.find("td",id="quantity")
    price = email.find("span",id="price")
    item_name = email.find("span",id="item-name")
    item_photo = email.find('img',id="item-photo")
    total = email.find("td",id="total")
    order_status = email.find("td",id="order-status")
    edit_button = email.find("a",id="edit-button")

    #added link to view orders page
    order_num['href'] = ORDERS_URL
    #add link to view listings
    edit_button['href'] = LISTINGS_URL + str(some_order['prodID'])
    
    email_summary.append("Order #%s Status Update: %s" %(some_order['orderID'],allStatuses[some_order['orderStatus']]))
    congo_type.append(some_order['congoType'])
    item_photo['src'] = some_order['imageLink']
    price.append('Ξ ')
    price.append(str(ethPrice))
    item_name.append(some_order['prodName'])
    quantity.append("Quantity ")
    quantity.append(str(some_order['quantity']))
    order_num.append(str(some_order['orderID']))
    timestamp.append(str(some_order['listingTimestamp']))
    seller_email.append(some_order['sellerContactDetails'])
    seller_email.append(email.new_tag('br'))
    seller_email.append(seller_a_tag)
    buyer_email.append(some_order['buyerContactDetails'])
    buyer_email.append(email.new_tag('br'))
    buyer_email.append(buyer_a_tag)
    total.append('Ξ ')
    total.append(str(ethTotal))
    order_status.append(allStatuses[some_order['orderStatus']])
    
    return str(email)

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
    productResults = products.find({"name": regx}).limit(20)
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
            "orders": [] if address is None else queryOrdersByBuyer(listingId, address)
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

serverStatusResult = client.Congo.command("serverStatus")
startWorkers()
print("Connected to Mongo Atlas:",serverStatusResult['host'])

if __name__ == '__main__':
    app.run()

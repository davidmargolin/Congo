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

allStatuses = {
    "0": "Listed",
    "1": "Processing",
    "2": "Shipped",
    "3": "Complete",
    "4": "Exception"
}

statusToEmoji = {
    "Listed": "✏️",
    "Processing": "💸",
    "Shipped" : "🚚💨",
    "Complete": "📦",
    "Exception": "⛔"
}


client = MongoClient("mongodb+srv://"+username+":"+password+"@cluster0-zaima.mongodb.net/test?retryWrites=true&w=majority&ssl_cert_reqs=CERT_NONE")
products = client.Congo.products
orders = client.Congo.orders

app=Flask(__name__)
CORS(app)

if (isProd):
    NETWORK_ID="3"
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

def convertEvent(event):
    jsonStr = ""
    for key in event.args:
        keyVal = '"' + key + '"'+ ": " + '"' + str(event.args[key]) + '"' + ','
        jsonStr += keyVal
    jsonStr = jsonStr[:-1]
    jsonStr = "{" + jsonStr + "}"
    res = json.loads(jsonStr)
    print(res)
    return res

def print_event(event):
    res = convertEvent(event)
    print(res)
    print(type(res))

def putNewProduct(event):
    newProduct = convertEvent(event)
    print("creating new listing with id: ",newProduct['id'])
    #add ts
    newProduct['listingTimestamp'] = datetime.datetime.utcnow()
    products.insert_one(newProduct)

def updateListing(event):
    # find an listing
    updatedListing = convertEvent(event)
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
    newOrder = convertEvent(event)
    newOrder['listingTimestamp'] = datetime.datetime.utcnow()
    orders.insert_one(newOrder)
    print("created new order with id:",newOrder['orderID'])

    #fetch image link to attach to obj in order to generate email body
    prodListing = products.find_one({"id": newOrder['orderID']})
    if(prodListing is None):
        newOrder['imageLink'] = "" # default no pic
    else:
        newOrder['imageLink'] = prodListing['imageLink'] 

    newOrder['congoType'] = ("%s You have a new order!"% statusToEmoji[newOrder['orderStatus']])
    content = generateNewOrderEmail(newOrder)
    sendEmail(newOrder['sellerContactDetails'],newOrder['congoType'],content)

def updateOrder(event):
    updatedOrder = convertEvent(event)
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
    orderLoaded = dumpThenLoad(res)
    print(orderLoaded)
    res['congoType'] = ("%s Your order has updated!" % statusToEmoji[res['orderStatus']])
    content = generateNewOrderEmail(res)
    sendEmail(orderLoaded['buyerContactDetails'],res['congoType'],content)

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

    email_summary.append("Order #%s Status Update: %s" %(some_order['orderID'],some_order['orderStatus']))
    congo_type.append(some_order['congoType'])
    item_photo['src'] = some_order['imageLink']
    price.append('Ξ')
    price.append(str(float(some_order['total']) / float(some_order['quantity'])))
    item_name.append(some_order['prodName'])
    quantity.append("Quantity ")
    quantity.append(str(some_order['quantity']))
    order_num.append(str(some_order['orderID']))
    timestamp.append(some_order['listingTimestamp'])
    seller_email.append(some_order['sellerContactDetails'])
    seller_email.append(email.new_tag('br'))
    seller_email.append(some_order['sellerAddress'])
    buyer_email.append(some_order['buyerContactDetails'])
    buyer_email.append(email.new_tag('br'))
    buyer_email.append(some_order['buyerAddress'])
    total.append('Ξ')
    total.append(str(some_order['total']))
    order_status.append(some_order['orderStatus'])

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
    listing = products.find_one({"id": id})
    return dumpThenLoad(listing)
    

# returns all listings by name
def queryListingsByName(name):
    regx = re.compile(name, re.I)
    productResults = products.find({"name": regx}).limit(20)
    return list(map(dumpThenLoad, list(productResults)))
    
# returns all listings by email
def queryListingsByEmail(email):
    productResults = products.find({"sellerContactDetails":email})
    return list(map(dumpThenLoad, list(productResults)))

# returns all orders by email
def queryOrdersByEmail(email):
    orderResults = orders.find({"buyerContactDetails":email})
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
    if listingId is not None:
        return jsonify(
            queryListingById(listingId)
        )
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

# get orders by email address
@app.route('/user/orders')
def userOrders():
    email = request.args.get('email') 
    if email is not None:
        return jsonify(
            {"orders": queryOrdersByEmail(email)}
        )
    else:
        return abort(400)

# get listings by email address
@app.route('/user/listings')
def userListings():
    email = request.args.get('email') 
    if email is not None:
        return jsonify(
            {"listings": queryListingsByEmail(email)}
        )
    else:
        return abort(400)

serverStatusResult = client.Congo.command("serverStatus")
startWorkers()
print("Connected to Mongo Atlas:",serverStatusResult['host'])

if __name__ == '__main__':
    app.run()

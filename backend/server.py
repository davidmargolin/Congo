from flask import Flask
from web3 import Web3,HTTPProvider,IPCProvider,WebsocketProvider
from threading import Thread
import requests
from requests.models import Response
import time
import json
from pymongo import MongoClient
import os
from flask import request
from flask import abort
from dotenv import load_dotenv
load_dotenv()

username = os.getenv('ATLASUSER')
password = os.getenv('ATLASPASS')

client = MongoClient("mongodb+srv://"+username+":"+password+"@cluster0-zaima.mongodb.net/test?retryWrites=true&w=majority&ssl_cert_reqs=CERT_NONE")
products = client.Congo.products
orders = client.Congo.orders

DEV_NODE='http://localhost:7545'
NODE_ADDRESS=DEV_NODE
CONTRACT_ADDRESS='0x1F6748B877333B2bA9f18935E157005FCC4FE8bd'

app=Flask(__name__)

w3=Web3(HTTPProvider(NODE_ADDRESS))


with open("../contracts/contracts/build/contracts/Congo.json") as f:
    info_json = json.load(f)
congo_abi = info_json["abi"]

event_filter=w3.eth.filter({"address":CONTRACT_ADDRESS})
contract=w3.eth.contract(address=CONTRACT_ADDRESS,abi=congo_abi)
accounts=w3.eth.accounts

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
            "sellerContactDetails": updatedListing['sellerContactDetails']
        }
    })

def putNewOrder(event):
    
    newOrder = convertEvent(event)
    orders.insert_one(newOrder)
    print("created new order with id:",newOrder['orderID'])

def updateOrder(event):
    updatedOrder = convertEvent(event)
    print("updating order with id: ",updatedOrder['orderID'])
    orders.update_one({'orderID': updatedOrder['orderID']},{
        "$set": {
            "orderStatus": updatedOrder['orderStatus']
        }
    })


def eventMap(event_filter,poll_interval,event_type):
    print("started worker thread!")
    while True:
        if(event_type == "productListed"):
            for event in event_filter.get_new_entries():
                putNewProduct(event)
        elif(event_type == "listingUpdated"):
            for event in event_filter.get_new_entries():
                updateListing(event)
        elif(event_type == "orderCreated"):
            for event in event_filter.get_new_entries():
                putNewOrder(event)
        elif(event_type == "orderUpdated"):
            for event in event_filter.get_new_entries():
                updateOrder(event)
        time.sleep(poll_interval)

# returns all listings by name
def queryListingsByName(name):
    productResults = products.find({"name":name})
    return list(productResults)
    
# returns all listings by email
def queryListingsByEmail(email):
    productResults = products.find({"sellerContactDetails":email})
    return list(productResults)

# returns all orders by email
def queryOrdersByEmail(email):
    orderResults = orders.find({"buyerContactDetails":email})
    return list(orderResults)

def startWorkers():
    filters = {
        "productListed" :contract.events.listingCreated.createFilter(fromBlock='latest'),
        "listingUpdated":contract.events.listingUpdated.createFilter(fromBlock='latest'),
        "orderCreated":contract.events.orderCreated.createFilter(fromBlock='latest'),  
        "orderUpdated":contract.events.orderUpdated.createFilter(fromBlock='latest')
    }
    for key in filters:
        worker=Thread(target=eventMap,args=(filters[key],5,key),daemon=True)
        worker.start()

@app.route('/')
def hello_world():
    return 'Welcome to the backend!'

# search listings by name
@app.route('/search')
def search():
    query = request.args.get('query')
    if query is not None:
        return json.dumps(
            {"results": queryListingsByName(query)}
        )
    else:
        return abort(400)

# get orders by email address
@app.route('/user/orders')
def userOrders():
    email = request.args.get('email') 
    if email is not None:
        return json.dumps(
            {"orders": queryOrdersByEmail(email)}
        )
    else:
        return abort(400)

# get listings by email address
@app.route('/user/listings')
def userListings():
    email = request.args.get('email') 
    if email is not None:
        return json.dumps(
            {"listings": queryListingsByEmail(email)}
        )
    else:
        return abort(400)

if __name__ == '__main__':
    serverStatusResult = client.Congo.command("serverStatus")
    startWorkers()
    print("Connected to Mongo Atlas:",serverStatusResult['host'])
    
    app.run()

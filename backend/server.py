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
isProd = os.getenv('ENVIRONMENT') == "production"

client = MongoClient("mongodb+srv://"+username+":"+password+"@cluster0-zaima.mongodb.net/test?retryWrites=true&w=majority&ssl_cert_reqs=CERT_NONE")
products = client.Congo.products
orders = client.Congo.orders

app=Flask(__name__)

if (isProd):
    CONTRACT_ADDRESS='0xD95F794BA7686bf0944b7Eb6fa7311BdeC762607'
    w3=Web3(WebsocketProvider('wss://ropsten.infura.io/ws'))
else:
    CONTRACT_ADDRESS='0xe5Bb754A97253249257A1b29E582e85d09137FCD'
    w3=Web3(HTTPProvider('http://localhost:7545'))


with open("../contracts/contracts/build/contracts/Congo.json") as f:
    info_json = json.load(f)
    congo_abi = info_json["abi"]
    
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
    worker=Thread(target=eventMap,args=(filters,5),daemon=True)
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

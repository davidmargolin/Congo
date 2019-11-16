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


username = os.environ['ATLASUSER']
password = os.environ['ATLASPASS']


client = MongoClient("mongodb+srv://"+username+":"+password+"@cluster0-zaima.mongodb.net/test?retryWrites=true&w=majority&ssl_cert_reqs=CERT_NONE")


DEV_NODE='http://localhost:7545'
NODE_ADDRESS=DEV_NODE
contract_address='0xe5Bb754A97253249257A1b29E582e85d09137FCD'
app=Flask(__name__)

w3=Web3(HTTPProvider(NODE_ADDRESS))


# congo = await Congo.deployed()
# updateItemTwo = await congo.updateListing(2,42,70,"details for item 2","item twoo!")

with open("../contracts/contracts/build/contracts/Congo.json") as f:
    info_json = json.load(f)
congo_abi = info_json["abi"]

event_filter=w3.eth.filter({"address":contract_address})
contract=w3.eth.contract(address=contract_address,abi=congo_abi)
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
    return res;

def print_event(event):
    res = convertEvent(event)
    print(res)
    print(type(res))

def putNewProduct(event,coll):
    print("newly listed prod")
    newProduct = convertEvent(event)
    print("creating new listing: ",newProduct['id'])
    coll.insert_one(newProduct)

def updateListing(event,coll):
    print("update listed prod")
    # find an listing
    updatedListing = convertEvent(event)
    print("incoming event: update listing",updatedListing)
    print("updating listing id: ",updatedListing['id'])
    coll.update_one({'id': updatedListing['id']},{
        "$set": {
            "quantity": updatedListing['quantity'],
            "price": updatedListing['price'],
            "details": updatedListing['details'],
            "name": updatedListing['name']
        }
    })

def putNewOrder(event,coll):
    print("new order")
    print_event(event)
    newOrder = convertEvent(event)
    coll.insert_one(newOrder)

def updateOrder(event,coll):
    print("updated order")
    updatedOrder = convertEvent(event)
    print("updating order with id: ",updatedOrder['id'])
    coll.update_one({'id': updatedOrder['id']},{
        "$set": {
            "quantity": updatedListing['quantity'],
            "price": updatedListing['price'],
            "details": updatedListing['details'],
            "name": updatedListing['name']
        }
    })


def eventMap(event_filter,poll_interval,event_type,products,orders):
    print("started worker thread!")
    while True:
        if(event_type == "productListed"):
            for event in event_filter.get_new_entries():
                putNewProduct(event,products)
            time.sleep(poll_interval)
        elif(event_type == "listingUpdated"):
            for event in event_filter.get_new_entries():
                updateListing(event,products)
            time.sleep(poll_interval)
        elif(event_type == "orderCreated"):
            for event in event_filter.get_new_entries():
                putNewOrder(event,orders)
            time.sleep(poll_interval)
        elif(event_type == "orderUpdated"):
            for event in event_filter.get_new_entries():
                updateOrder(event,orders)
            time.sleep(poll_interval)

def queryNetwork(address,moduleType,actionType):
    parameters={
        'module':moduleType,
        'action':actionType,
        'address':address,
        'apikey':apiKey
    }
    r = requests.get(url=apiURL,params=parameters)
    response = r.json()
    return response
#builds a response for a listing query
def queryListing(userQuery,coll):
    listings = coll.find({"name":userQuery})
    if listings is None:
        print("no items were found with query:",userQuery)
        return craftResponse(b'{"found":false}',204)
    elif listings:
        jsonStr = '{"listings":['
        for listing in listings:
            listing.pop('_id',None)
            jsonStr += (json.dumps(listing)+',')
        jsonStr = jsonStr[:-1]
        jsonStr += ']}'
        print(jsonStr)
        jsonData = json.loads(jsonStr)
        res = craftResponse(json.dumps(jsonData).encode(),200)
        print(res)
        return res
    else:
        return craftResponse(b'{"found":false}',204)
    
    

def craftResponse(content,statusCode):
    aResponse = Response()
    aResponse.code = "expired"
    aResponse.error_type = "expired"
    aResponse.status_code = statusCode
    aResponse._content = content
    return aResponse.json()

def startWorkers(products,orders):
    productListed_filter=contract.events.listingCreated.createFilter(fromBlock='latest')
    listingUpdated_filter=contract.events.listingUpdated.createFilter(fromBlock='latest')
    orderCreated_filter=contract.events.orderCreated.createFilter(fromBlock='latest')
    orderUpdated_filter=contract.events.orderUpdated.createFilter(fromBlock='latest')
    filters = {"productListed" :productListed_filter,
               "listingUpdated":listingUpdated_filter,
               "orderCreated":orderCreated_filter,  
               "orderUpdated":orderUpdated_filter
               }
    for key in filters:
        worker=Thread(target=eventMap,args=(filters[key],5,key,products,orders),daemon=True)
        worker.start()

@app.route('/')
def hello_world():
    return 'Welcome to the backend!'

@app.route('/search/<congoType>')
def search(congoType):
    print(congoType,request.args.get('searchTerm'))
    if congoType == "orders":
        print("search for orders")
    elif congoType == "listings":  
        if request.args.get('searchTerm') is None:
            print("invalid search term")
        else:
            return queryListing(request.args.get('searchTerm'),products)
    return craftResponse(b'{"status":"invalid search type or searchTerm"}',404)


if __name__ == '__main__':
    serverStatusResult = client.Congo.command("serverStatus")
    products = client.Congo.products
    orders = client.Congo.orders
    startWorkers(products,orders);
    print("Connected to Mongo Atlas:",serverStatusResult['host'])
    
    app.run()

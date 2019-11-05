from flask import Flask
from web3 import Web3,HTTPProvider,IPCProvider,WebsocketProvider
from threading import Thread
import requests
import time
import json
from pymongo import MongoClient
import os


username = os.environ['ATLASUSER']
password = os.environ['ATLASPASS']


client = MongoClient("mongodb+srv://"+username+":"+password+"@cluster0-zaima.mongodb.net/test?retryWrites=true&w=majority&ssl_cert_reqs=CERT_NONE")


DEV_NODE='http://localhost:7545'
NODE_ADDRESS=DEV_NODE
contract_address='0xe5Bb754A97253249257A1b29E582e85d09137FCD'
app=Flask(__name__)

w3=Web3(HTTPProvider(NODE_ADDRESS))

apiURL="https://api.etherscan.io/api?"
apiKey="S4TBCHFSXQFMW43VZKB436H91PXFU4CPUN"

# congo = await Congo.deployed()
# updateItemTwo = await congo.updateListing(2,42,70,"details for item 2","item twoo!")

with open("../contracts/contracts/build/contracts/Congo.json") as f:
    info_json = json.load(f)
congo_abi = info_json["abi"]
# print(congo_abi)

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
    # print(jsonStr)
    # print(type(jsonStr))

    res = json.loads(jsonStr)
    print(res)
    return res;

def print_event(event):
    res = convertEvent(event)
    print(res)
    print(type(res))

def putNewProduct(event,coll):
    print("newly listed prod")
    # print_event(event)
    newProduct = convertEvent(event)
    print("creating new listing: ",newProduct['id'])
    coll.insert_one(newProduct)

def updateListing(event,coll):
    print("update listed prod")
    # print_event(event)
    # find an listing
    updatedListing = convertEvent(event)
    print("incoming event: update listing",updatedListing)
    # listing = coll.find_one({'id':updatedListing['id']})
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

@app.route('/search/<itemText>')
def search(itemText):
    print("incomingitemquery:"+itemText)
    return queryNetwork(itemText,"account","balance")


if __name__ == '__main__':
    # try:
    serverStatusResult = client.Congo.command("serverStatus")
    products = client.Congo.products
    orders = client.Congo.orders
    startWorkers(products,orders);
    print("Connected to Mongo Atlas:",serverStatusResult['host'])
    # except:
        # print("Failed to establish connection to DB")
    
    app.run()

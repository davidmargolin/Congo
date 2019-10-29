from flask import Flask
from web3 import Web3,HTTPProvider,IPCProvider,WebsocketProvider
from threading import Thread
import requests
import time
import json

DEV_NODE='http://localhost:7545'
NODE_ADDRESS=DEV_NODE
contract_address='0xD95F794BA7686bf0944b7Eb6fa7311BdeC762607'
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
    return json.loads(jsonStr)


def print_event(event):
    res = convertEvent(event)
    print(res)
    print(type(res))

def putNewProduct(event):
    print("newly listed prod")
    print_event(event)

def updateListing(event):
    print("update listed prod")
    print_event(event)

def putNewOrder(event):
    print("new order")
    print_event(event)

def updateOrder(event):
    print("updated order")
    print_event(event)


def log_loop(event_filter,poll_interval,event_type):
    print("started worker thread!")
    while True:
        if(event_type == "productListed"):
            for event in event_filter.get_new_entries():
                putNewProduct(event)
            time.sleep(poll_interval)
        elif(event_type == "listingUpdated"):
            for event in event_filter.get_new_entries():
                updateListing(event)
            time.sleep(poll_interval)
        elif(event_type == "orderCreated"):
            for event in event_filter.get_new_entries():
                putNewOrder(event)
            time.sleep(poll_interval)
        elif(event_type == "orderUpdated"):
            for event in event_filter.get_new_entries():
                updateOrder(event)
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

@app.route('/')
def hello_world():
    return 'Welcome to the backend!'

@app.route('/search/<itemText>')
def search(itemText):
    print("incomingitemquery:"+itemText)
    return queryNetwork(itemText,"account","balance")


if __name__ == '__main__':
    productListed_filter=contract.events.productListed.createFilter(fromBlock='latest')
    listingUpdated_filter=contract.events.listingUpdated.createFilter(fromBlock='latest')
    orderCreated_filter=contract.events.orderCreated.createFilter(fromBlock='latest')
    orderUpdated_filter=contract.events.orderUpdated.createFilter(fromBlock='latest')
    filters = {"productListed" :productListed_filter,
               "listingUpdated":listingUpdated_filter,
               "orderCreated":orderCreated_filter,  
               "orderUpdated":orderUpdated_filter
               }
    for key in filters:
        worker=Thread(target=log_loop,args=(filters[key],5,key),daemon=True)
        worker.start()
    app.run()

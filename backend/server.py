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



with open("../contracts/contracts/build/contracts/Congo.json") as f:
    info_json = json.load(f)
congo_abi = info_json["abi"]
# print(congo_abi)

event_filter=w3.eth.filter({"address":contract_address})
contract=w3.eth.contract(address=contract_address,abi=congo_abi)
accounts=w3.eth.accounts


def print_event(event):
    # print(event)
    eventJson = json.load(w3.toJSON(event))
    print(eventJson)
    print(eventJson['args'])
    # receipt=w3.eth.waitForTransactionReceipt(event['transactionHash'])
    # print("receipt:"+receipt)
    # result=contract.events.greeting.processReceipt(receipt)
    # print("result:"+result)

    # print(result[0]['args'])


def log_loop(event_filter,poll_interval):
    while True:
        for event in event_filter.get_new_entries():
            print_event(event)
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
    worker=Thread(target=log_loop,args=(productListed_filter,5),daemon=True)
    worker.start()
    app.run()

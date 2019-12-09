congo = await Congo.deployed()

var accounts;
web3.eth.getAccounts(function(err,res) { accounts = res; });
var deployer = accounts[0];
var buyer = accounts[1];
var seller = accounts[2];
var buyer_two = accounts[3];
var seller_two = accounts[4];

createItemOne = await congo.createListing(1,web3.utils.toWei('18','ether'),"item 1 details","https://www.imgur.com/a/imageid1","item1","sellerOne@email.com",{from: seller})
createItemTwo = await congo.createListing(2,web3.utils.toWei('36',"ether"),"item 2 details","item2","https://www.imgur.com/a/imageid12","sellerTwo@email.com",{from: seller_two})
createItemThree = await congo.createListing(6,web3.utils.toWei('9',"ether"),"item 3 deets","item3","https://www.imgur.com/a/imageid123","sellerOne@email.com",{from: seller})

updateItemTwoAsSellerOne = await congo.updateListing(2,4,web3.utils.toWei('64',"ether"),"haha changed item 2","item2","https://www.imgur.com/a/imageid123","sellerOne@email.com",{from: seller})
updateItemTwoAsSellerTwo = await congo.updateListing(2,2,web3.utils.toWei('20',"ether"),"item 2 details","item2","https://www.imgur.com/a/imageid123","sellerTwo@email.com",{from: seller_two})

createOrderOneItemTwoAsSellerTwo = await congo.createOrder(2,1,"fast ship plz","sellerTwo@email.com",{from: seller_two, value: web3.utils.toWei('20',"ether")})
createOrderOneItemTwoAsBuyerOne = await congo.createOrder(2,1,"fast ship plz","buyerOne@email.com",{from: buyer, value: web3.utils.toWei('20',"ether")})
itemTwo = await congo.products.call(2)
createOrderOneItemTwoAsBuyerTwo = await congo.createOrder(2,1,"fast ship plz","buyerTwo@email.com",{from: buyer_two, value: web3.utils.toWei('20',"ether")})
itemTwo = await congo.products.call(2)
updateOrderOneAsSellerOne = await congo.updateOrder(1,3,{from:seller})
updateOrderOneAsSellerTwo = await congo.updateOrder(1,3,{from: seller_two})




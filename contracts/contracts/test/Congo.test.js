const Congo = artifacts.require('./Congo.sol')
require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Congo', ([deployer, seller, buyer]) => {
  let congo

  before(async () => {
    congo = await Congo.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await congo.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('Congo Exchange Detected', async () => {
      const name = await congo.name()
      assert.equal(name, 'Congo Exchange')
    })
  })

  describe('products', async () => {
    let result, productCount

    before(async () => {
      result = await congo.createListing(1,web3.utils.toWei('2.5','ether'),"best iPhone ever.","iPhone X","https://www.imgur.com/a/imageid1","kentkfeng@gmail.com",{from: seller})
      productCount = await congo.productCount()
    })

    it('creates products', async () => {
      // SUCCESS
      assert.equal(productCount, 1,"product count incrementing")
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), productCount.toNumber(), 'productCount correct')
      assert.equal(event.name, 'iPhone X', 'listing name is correct')
      assert.equal(event.price, web3.utils.toWei('2.5','ether'), 'price is correct')
      assert.equal(event.owner, seller, 'owner is correct')
      assert.equal(event.quantity,1,'quantity is correct')
      assert.equal(event.details,'best iPhone ever.','details are correct')
      assert.equal(event.imageLink, 'https://www.imgur.com/a/imageid1','image listing link is correct')
      assert.equal(event.sellerContactDetails,'kentkfeng@gmail.com','seller contact email is correct')


      // FAILURE: Including empty strings for each argument.
      await await congo.createListing(0,web3.utils.toWei('2.5', 'Ether'),"details2","item2","imgLink2","kentkfeng@gmail.com", { from: seller }).should.be.rejected;
      await await congo.createListing(1,web3.utils.toWei('0', 'Ether'),"details2","item2","imgLink2","kentkfeng@gmail.com", { from: seller }).should.be.rejected;
      await await congo.createListing(1,web3.utils.toWei('2.5', 'Ether'),"","item2","imgLink2","kentkfeng@gmail.com", { from: seller }).should.be.rejected;
      await await congo.createListing(1,web3.utils.toWei('2.5', 'Ether'),"details2","","imgLink2","kentkfeng@gmail.com", { from: seller }).should.be.rejected;
      await await congo.createListing(1,web3.utils.toWei('2.5', 'Ether'),"details2","item2","","kentkfeng@gmail.com", { from: seller }).should.be.rejected;
      await await congo.createListing(1,web3.utils.toWei('2.5', 'Ether'),"details2","item2","imgLink2","", { from: seller }).should.be.rejected;
      // FAILURE: Product must have a price
      await await congo.createListing(1, { from: seller }).should.be.rejected;
    })

    it('lists products', async () => {
      const product = await congo.products(productCount)
      assert.equal(product.id.toNumber(), productCount.toNumber(), 'productCount correct')
      assert.equal(product.name, 'iPhone X', 'listing name is correct')
      assert.equal(product.price, web3.utils.toWei('2.5','ether'), 'price is correct')
      assert.equal(product.owner, seller, 'owner is correct')
      assert.equal(product.quantity,1,'quantity is correct')
      assert.equal(product.imageLink, 'https://www.imgur.com/a/imageid1','image listing link is correct')
      assert.equal(product.sellerContactDetails,'kentkfeng@gmail.com','seller contact email is correct')
      assert.equal(product.details,'best iPhone ever.','details are correct')
    })

    it('create order', async () => {
      // Track the seller balance before purchase
      let oldSellerBalance
      oldSellerBalance = await web3.eth.getBalance(seller)
      oldSellerBalance = new web3.utils.BN(oldSellerBalance)

      // SUCCESS: Buyer makes purchase
      let itemID = 1
      let qtyBuy = 1
      let notes = "express shipping please."
      let buyerEmail = "kentkfeng@gmail.com"
      let sellerEmail = "kentkfeng@gmail.com"
      let ordStat = "0"
      let amountToSend = web3.utils.toWei('2.5', 'Ether')
      result = await congo.createOrder(itemID, qtyBuy, notes,buyerEmail,{ from: buyer, value: amountToSend})

      // Check logs
      // check if listing updated.
      const updatedListing = result.logs[0].args
      assert.equal(updatedListing.id.toNumber(), productCount.toNumber(), 'productCount correct')
      assert.equal(updatedListing.name, 'iPhone X', 'listing name is correct')
      assert.equal(updatedListing.price, web3.utils.toWei('2.5','ether'), 'price is correct')
      assert.equal(updatedListing.owner, seller, 'owner is correct')
      assert.equal(updatedListing.quantity.toNumber(),0,'quantity is deducted.')
      assert.equal(updatedListing.imageLink, 'https://www.imgur.com/a/imageid1','image listing link is correct')
      assert.equal(updatedListing.sellerContactDetails,'kentkfeng@gmail.com','seller contact email is correct')
      assert.equal(updatedListing.details,'best iPhone ever.','details are correct')

      // check if order details match order arguments.
      const order = result.logs[1].args
      assert.equal(order.prodID.toNumber(), itemID, 'prod id is correct')
      assert.equal(order.quantity.toNumber(),qtyBuy, 'buy qty is correct')
      assert.equal(order.total, amountToSend, 'total price is correct')
      assert.equal(order.buyerAddress, buyer, 'buyer eth addy is correct')
      assert.equal(order.sellerAddress, seller, 'seller eth addy is correct')
      assert.equal(order.notes,notes, 'notes are correct')
      assert.equal(order.sellerContactDetails, sellerEmail, 'seller contact is correct')
      assert.equal(order.buyerContactDetails, buyerEmail, 'buyer contact is correct')
      assert.equal(order.orderStatus,ordStat,'order status is correct')

      // Check that seller received funds
      let newSellerBalance
      newSellerBalance = await web3.eth.getBalance(seller)
      newSellerBalance = new web3.utils.BN(newSellerBalance)

      let price
      price = web3.utils.toWei('2.5', 'Ether')
      price = new web3.utils.BN(price)

      const exepectedBalance = oldSellerBalance.add(price)

      assert.equal(newSellerBalance.toString(), exepectedBalance.toString())
      
    })

    it('prevents buyer from tampering with listing & blocks internal func calls', async () => {
        let id = productCount
        let qty = 1
        let price = web3.utils.toWei('2.5', 'Ether')
        let details = "hijacked listing!"
        let name = "NO ITEM NAME"
        let imageLink = "www.google.com/hireme"
        let sellerContact = "kentkfeng@gmail.com"
        // buyer tries to tamper with seller's listing
        buyerUpdatesListing = await congo.updateListing(id,qty,price,details,name,imageLink,sellerContact,{from:buyer}).should.be.rejected
        // seller tries to update quantity after purchase
        // sellerUpdatesQuantity = await congo.updateQuantity(id,69,{from:seller}).should.be.rejected

    })
  })
})
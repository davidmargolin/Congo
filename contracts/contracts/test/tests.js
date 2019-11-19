const Congo = artifacts.require("./Congo.sol");

contract("Congo", accounts => {
  let congo = before(async () => {
    congo = await Congo.deployed();
  });

  let deployer = accounts[0];
  let buyer = accounts[1];
  let seller = accounts[2];
  let buyer_two = accounts[3];
  let seller_two = accounts[4];

  describe("deployment", async () => {
    it("deploys successfully", async () => {
      const address = await congo.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, "");
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    });
  });

  describe("products", async () => {
    let createItemOne, createItemTwo, createItemThree, productCount;

    before(async () => {
      createItemOne = await congo.createListing(
        1,
        web3.utils.toWei("5", "ether"),
        "item 1 details",
        "item1",
        "sellerOne@email.com",
        { from: seller }
      );
      createItemTwo = await congo.createListing(
        2,
        web3.utils.toWei("36", "ether"),
        "item 2 details",
        "item2",
        "sellerTwo@email.com",
        { from: seller_two }
      );
      createItemThree = await congo.createListing(
        6,
        web3.utils.toWei("9", "ether"),
        "item 3 deets",
        "item3",
        "sellerOne@email.com",
        { from: seller }
      );
      console.log("productCount:", productCount);
      productCount = await congo.productCount();
      console.log("productCount:", productCount.toString());
    });

    it("creates products", async () => {
      assert.equal(productCount, 3);
    });
  });

  describe("updated products", async () => {
    let updateItemTwoAsSellerTwo;

    before(async () => {
      /*This call will fail the test
      updateItemTwoAsSellerOne = await congo.updateListing(
        2,
        4,
        web3.utils.toWei("64", "ether"),
        "haha changed item 2",
        "item2",
        "sellerOne@email.com",
        { from: seller }
      );
      */

      //This call will succeed
      updateItemTwoAsSellerTwo = await congo.updateListing(
        2,
        2,
        web3.utils.toWei("20", "ether"),
        "item 2 details",
        "item2",
        "sellerTwo@email.com",
        { from: seller_two }
      );
    });

    it("updates product listing", async () => {
      const event = updateItemTwoAsSellerTwo.logs[0].args;
      assert.equal(event.details, "item 2 details");
    });
  });

  describe("orders", async () => {
    let createOrderOneItemTwoAsBuyerOne;

    before(async () => {
      /* This call will fail the test
      createOrderOneItemTwoAsSellerTwo = await congo.createOrder(
        2,
        1,
        "fast ship plz",
        "sellerTwo@email.com",
        { from: seller_two, value: web3.utils.toWei("20", "ether") }
      );
      */

      createOrderOneItemTwoAsBuyerOne = await congo.createOrder(
        2,
        1,
        "fast ship plz",
        "buyerOne@email.com",
        { from: buyer, value: web3.utils.toWei("20", "ether") }
      );
    });

    it("creates orders", async () => {
      //console.log(createOrderOneItemTwoAsBuyerOne.logs[0].args);
      //const event1 = createOrderOneItemTwoAsSellerTwo.logs[0].args;

      const event2 = createOrderOneItemTwoAsBuyerOne.logs[0].args;
      assert.equal(event2.sellerContactDetails, "sellerTwo@email.com");
    });
  });

  describe("update orders", async () => {
    let updateOrderOneAsSellerTwo;

    before(async () => {
      /* This will fail the test
      updateOrderOneAsSellerOne = await congo.updateOrder(1, 3, {
        from: seller
      });
      */

      updateOrderOneAsSellerTwo = await congo.updateOrder(1, 3, {
        from: seller_two
      });
    });

    it("updates order listings", async () => {
      const event = updateOrderOneAsSellerTwo.logs[0].args;
      assert.equal(event.orderStatus, 3);
    });
  });
});

/*
  describe("", async() =>{
    before(async () =>{

    })

    it("", async() =>){
      
    }
  })
*/

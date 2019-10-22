const Congo = artifacts.require('./Congo.sol')
require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Congo',([deployer,seller,buyer]) =>{
    let Congo
    before(async () =>{
        Congo = await Congo.deployed()
    })

    describe('deployment', async () =>{
        it('deploys succesfully', async () =>{
            const address = await Congo.address
            assert.notEqual(address,0x0)
            assert.notEqual(address,'')
            assert.notEqual(address,null)
            assert.notEqual(address,undefined)

        })

        it('has a name', async () =>{
            const name = await Congo.name();
            assert.equal(name, 'Congo Exchange');
        })
    })

    describe('products', async () =>{
        let result, productCount

        before(async ()=>{
            result = await Congo.createListing(3,web3.utils.toWei('1','Ether'),"some product details","some product", {from: seller});
            productCount = await Congo.productCount()
        })

        it('creates products',async ()=>{
            assert.equal(productCount, 1)
            const event = result.logs[0].args
            assert.equal(event.id.toNumber(),productCount.toNumber(),'listing id is correct')
            assert.equal(event.quantity,3, 'quantity is correct')
            assert.equal(event.price,web3.utils.toWei('1','Ether'), 'price is correct')
            assert.equal(event.details,"some product details", "details are correct")
            assert.equal(event.name,"some product", 'title is correct')
            assert.equal(event.owner,seller, 'owner is seller')

            //no name test case
            await await Congo.createListing(3,web3.utils.toWei('1','Ether'),"some product details", {from: seller}).should.be.rejected;
            //no price test case
            await await Congo.createListing(3,"some product details","some product", {from: seller}).should.be.rejected;
            
        })
    })
})
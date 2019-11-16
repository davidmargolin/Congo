# Deploying Congo to Ropsten

## Requirements
1. Deployer's Private Key from [MetaMask](https://metamask.io/)
2. Get Enough [test ether](https://faucet.metamask.io/) to deploy contract (<.3 ETH)
3. Get a Ropstein API key by setting up a project on [Infura](https://infura.io/)

## Create .secret
the contract deployer's private key can be obtained by opening metamask.
Create a file called `.secret` with contract deployer's private key in directory with the `truffle-config.js`:
```txt
pRiVaTeKeYhErE
```

## setup truffle
```bash
npm init
npm install --save truffle-hdwallet-provider
npm install -g truffle
truffle init
```

## prepping contracts 
when you have .sol contract you're ready to deploy.
navigate to the `/migrations` directory and create a new file.
Note: beginning file name with numbers in ascending order determines the order files are run (e.g 2 files named 1_file.js, 2_file.js => 2_file will run after 1 runs.)
```bash
touch 2_deploy_congo.js
```
Put contents below into file.
```javascript
const Congo = artifacts.require("Congo");
module.exports = function(deployer) {
  deployer.deploy(Congo);
};
```

## Edit truffle-config.js
add the lines below and uncomment the `ropsten` key inside of `modules.export`
```javascript
const HDWalletProvider = require('truffle-hdwallet-provider');
const infuraKey = "INFURA_API_KEY_HERE";
const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();
module.exports ={
    ...
    ropsten: {
      provider: function() {
        return new HDWalletProvider(MNEMONIC, "https://ropsten.infura.io/"+infuraKey)
      },
      network_id: 3,
      gas: 4000000      //make sure this gas allocation isn't over 4M, which is the max
    }
}
```

## Profit $
```bash
truffle deploy --network ropsten
```

## Access Deployed Contract from truffle console
```bash
truffle console --network ropsten
truffle(ropsten)> congo = await Congo.deployed()
```
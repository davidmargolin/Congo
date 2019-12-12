# Deploying Congo to Ropsten

## Requirements

1. Deployer's Private Key from [MetaMask](https://metamask.io/)
2. Get Enough [test ether](https://faucet.metamask.io/) to deploy contract (<.3 ETH)
3. Get a Ropstein API key by setting up a project on [Infura](https://infura.io/)

## Create .secret

the contract deployer's private key can be obtained by opening metamask.
Create a file called `.secret` with an infura key and contract deployer's private key in the same directory as `truffle-config.js`:

```txt
infurakey
privatekey
```

## setup truffle

```bash
npm init
npm install --save truffle-hdwallet-provider
npm install -g truffle
truffle init
```

## Profit \$

```bash
truffle deploy --network ropsten
```

## Access Deployed Contract from truffle console

```bash
truffle console --network ropsten
truffle(ropsten)> congo = await Congo.deployed()
```

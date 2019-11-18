import React, { useState, useEffect } from "react";
import Web3 from "web3";
import CongoMarket from "./../contracts/contracts/build/contracts/Congo.json";
import AddProduct from "./AddProduct.jsx";

const MetaMask = () => {
  const [account, setAccount] = useState("");

  const [productCount, setProductCount] = useState(0);
  //const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marketState, setMarketState] = useState();

  async function getWeb3() {
    if (await loadWeb3()) {
      await loadBlockChainData();
    }
  }

  useEffect(() => {
    getWeb3();
  }, []);

  async function loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Etherium browser detected. Consider MetaMask or some other Etherium browser extension!"
      );
      return false;
    }
    return true;
  }

  async function loadBlockChainData() {
    const web3 = window.web3;
    //loads account information
    const accounts = await web3.eth.getAccounts();
    //console.log(accounts);
    setAccount(accounts[0]);

    const networkID = await web3.eth.net.getId();
    const networkData = CongoMarket.networks[networkID];
    if (networkData) {
      const market = new web3.eth.Contract(
        CongoMarket.abi,
        networkData.address
      );

      setMarketState(market);
      const count = await marketState.methods.productCount().call();
      setProductCount(count);
      console.log(count.toString());

      setLoading(false);
    } else {
      window.alert(
        "The Congo smart contract is not deployed to the current network"
      );
    }
  }

  //NEED TO FIGURE OUT ID GENERATOR
  function createProduct(name, price, quantity, description, email) {
    setLoading(true);
    //TEMP ID GENERATOR
    const id = productCount + 1;
    marketState.methods
      .createProduct(id, price, description, email)
      .send({ from: this.account })
      .once("recipt", recipt => {
        setLoading(false);
      });
  }

  return (
    <div>
      {loading ? (
        "Loading account information..."
      ) : (
        <div>
          Wallet Address: {account}
          <AddProduct createProduct={createProduct} />
        </div>
      )}
    </div>
  );
};

export default MetaMask;

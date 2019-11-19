import React, { useState, useEffect } from "react";
import Web3 from "web3";
import CongoMarket from "./../contracts/contracts/build/contracts/Congo.json";
import AddProduct from "./AddProduct.jsx";

const MetaMask = () => {
  const [account, setAccount] = useState("");

  const [productCount, setProductCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  let [marketState, setMarketState] = useState();

  //check if ethereum browser is being used
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
    //loads account information of first wallet, will make variable later
    const accounts = await web3.eth.getAccounts();
    setAccount(accounts[0]);

    //checks if smart contract is deployed on the network
    const networkID = await web3.eth.net.getId();
    const networkData = CongoMarket.networks[networkID];

    if (!networkData) {
      window.alert(
        "The Congo smart contract is not deployed to the current network"
      );
      return;
    }

    const market = new web3.eth.Contract(CongoMarket.abi, networkData.address);

    const count = await market.methods.productCount().call();
    setProductCount(count.toString());

    let tmpArr = [];
    for (let i = 1; i <= count; i++) {
      //console.log(i);
      const newProduct = await market.methods.products(i).call();
      //console.log(newProduct);
      tmpArr = [...tmpArr, newProduct];
    }

    console.log(tmpArr);

    setProducts(tmpArr);
    //doesn't set marketState = market immediately
    setMarketState(market);
    //console.log(marketState);
    setLoading(false);
  }

  //Need to figure out better ID generator in smart contract?
  const createListing = (name, price, quantity, description, email) => {
    setLoading(true);
    marketState.methods
      .createListing(quantity, price, description, name, email)
      .send({ from: account })
      .once("receipt", receipt => {
        setLoading(false);
      });
  };

  //NEEDS TO BE UPDATED WHEN HOOKED WITH CART
  const createOrder = (id, price, quantity, notes, email) => {
    setLoading(true);
    marketState.methods
      .createOrder(id, quantity, notes, email)
      .send({ from: account, value: price })
      .once("receipt", receipt => {
        setLoading(false);
      });
  };

  return (
    <div>
      {loading ? (
        "Loading account information..."
      ) : (
        <div>
          Wallet Address: {account}
          <AddProduct
            createListing={createListing}
            createOrder={createOrder}
            products={products}
          />
          Reminder: Don't try to purchase a listing if you are the seller
          <div></div>
          Number of products on Congo: {productCount}
          {console.log(products)}
        </div>
      )}
    </div>
  );
};

export default MetaMask;

import React, { useState, useEffect } from "react";
import Web3 from "web3";
<<<<<<< HEAD
import CongoMarket from "./../../src/contracts/contracts/build/contracts/Congo.json";
=======
>>>>>>> Access to basic wallet information

const MetaMask = () => {
  const [account, setAccount] = useState("");

  /*
  const [productCount, setProductCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
<<<<<<< HEAD
  const [marketState, setMarketState] = useState();
=======
>>>>>>> Fixed calls to get information from browser wallet
  */
  const [marketState, setMarketState] = useState();

  async function getWeb3() {
    if (await loadWeb3()) {
      await loadBlockChainData();
    }
=======

  */

  async function getWeb3() {
    await loadWeb3();
    //await loadBlockChainData();
>>>>>>> Access to basic wallet information
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
<<<<<<< HEAD
      return false;
    }
    return true;
=======
    }
>>>>>>> Access to basic wallet information
  }

  async function loadBlockChainData() {
    const web3 = window.web3;
    //loads accoont information
    const accounts = await web3.eth.getAccounts();
    //console.log(accounts);
    setAccount(accounts[0]);
<<<<<<< HEAD

    const networkID = await web3.eth.net.getId();
    const networkData = CongoMarket.networks[networkID];
    if (networkData) {
      const market = new web3.eth.Contract(
        CongoMarket.abi,
        networkData.address
      );

      setMarketState(market);
      //setLoading(false);
    } else {
      window.alert("Congo smart contract is not deployed to current network");
    }
=======
>>>>>>> Access to basic wallet information
  }

  return <div>{account}</div>;
};

export default MetaMask;

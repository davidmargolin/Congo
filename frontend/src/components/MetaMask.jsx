import React, { useState, useEffect } from "react";
import Web3 from "web3";

const MetaMask = () => {
  const [account, setAccount] = useState("");

  /*
  const [productCount, setProductCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  */

  async function getWeb3() {
    await loadWeb3();
    //await loadBlockChainData();
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
    }
  }

  async function loadBlockChainData() {
    const web3 = window.web3;
    //loads accoont information
    const accounts = await web3.eth.getAccounts();
    //console.log(accounts);
    setAccount(accounts[0]);
  }

  return <div>{account}</div>;
};

export default MetaMask;
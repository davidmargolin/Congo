import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { abi } from "../../assets/contract.json";
import Web3 from "web3";

const getListing = id =>
  fetch(
    `https://congo-mart.herokuapp.com/listing/${encodeURIComponent(id)}`
  ).then(res => res.json());

const CONTRACT_ADDRESS = "0xD95F794BA7686bf0944b7Eb6fa7311BdeC762607";

const makePurchase = (id, price, quantity, email) => {
  if (window.ethereum) {
    window.ethereum
      .enable()
      .then(() => {
        const web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
        web3.eth.getAccounts().then(accounts => {
          const transaction = contract.methods.createOrder(
            id,
            quantity,
            CONTRACT_ADDRESS,
            email
          );
          transaction
            .send({
              from: web3.currentProvider.selectedAddress || accounts[0],
              value: price
            })
            .then(response => console.log(response));
        });
      })
      .catch(error => {
        console.log(error);
      });
  }
};

const ListingPage = () => {
  const { listingID } = useParams();
  const [listingData, setListingData] = useState(null);
  useEffect(() => {
    getListing(listingID).then(data => {
      setListingData(data);
    });
  }, [listingID]);

  if (!listingData) return <div></div>;
  return (
    <span
      style={{
        display: "flex",
        flex: 1,
        alignItems: "center",
        flexDirection: "column"
      }}
    >
      <div
        style={{
          flexDirection: "row",
          display: "flex",
          flexWrap: "wrap",
          maxWidth: 1500,
          padding: 24,
          justifyContent: "flex-start"
        }}
      >
        <img src={listingData.image} style={{ width: 400, height: 400 }} />
        <br />
        <div style={{ flex: 1, marginLeft: 40 }}>
          <h3>{listingData.name}</h3>
          <p>{listingData.price}</p>
          <a href={`https://ropsten.etherscan.io/address/${listingData.owner}`}>
            View Seller Info
          </a>
          <p>{listingData.details}</p>
          <button
            onClick={() =>
              makePurchase(listingID, listingData.price, 1, "test@test.com")
            }
          >
            Buy Now
          </button>
        </div>
      </div>
    </span>
  );
};

export default ListingPage;

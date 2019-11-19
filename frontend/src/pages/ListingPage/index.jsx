import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { abi } from "../../assets/contract.json";
import Web3 from "web3";

const getListing = id =>
  fetch(
    `https://congo-mart.herokuapp.com/listing/${encodeURIComponent(id)}`
  ).then(res => res.json());

const CONTRACT_ADDRESS = "0xD95F794BA7686bf0944b7Eb6fa7311BdeC762607";

const ListingPage = () => {
  const { listingID } = useParams();
  const [listingData, setListingData] = useState(null);

  useEffect(() => {
    getListing(listingID).then(data => {
      console.log(data);
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
            onClick={() => {
              if (window.ethereum && window.web3) {
                window.ethereum.enable().then(accounts => {
                  const web3 = new Web3(window.web3.currentProvider);
                  const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
                  contract.methods
                    .createOrder(
                      listingID,
                      1,
                      CONTRACT_ADDRESS,
                      "test@test.com"
                    )
                    .send({
                      from: accounts[0],
                      to: "",
                      value: listingData.price,
                      gasPrice: "20000000000"
                    })
                    .then(response => console.log(response));
                }).catch(error => {
                  console.log(error)
                })
              }
            }}
          >
            Buy Now
          </button>
        </div>
      </div>
    </span>
  );
};

export default ListingPage;

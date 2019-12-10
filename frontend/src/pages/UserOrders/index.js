import React, { useEffect, useState, useContext } from "react";
import Listing from "../../components/Listing";
import { EthereumContext } from "../../context/EthereumContext";

const getListingsByOwner = owner =>
  fetch(
    `https://congo-mart.herokuapp.com/user/orders?buyer=${encodeURIComponent(owner)}`
  ).then(res => res.json());

const UserOrders = () => {
  const [listings, setListings] = useState([]);
  const { chosenAccount } = useContext(EthereumContext);

  useEffect(() => {
    getListingsByOwner(chosenAccount).then(({ listings: results }) => {
      setListings(results);
    });
  }, [chosenAccount]);
  return (
    <span
      style={{
        display: "flex",
        flex: 1,
        alignItems: "center",
        flexDirection: "column"
      }}
    >
      <p>{listings.length>0?"Your Orders:":"No orders found"}</p>

      <div
        style={{
          flexDirection: "row",
          display: "flex",
          flexWrap: "wrap",
          maxWidth: 1500,
          justifyContent: "center"
        }}
      >
        {listings.map(({ name, price, id, imageLink }) => (
          <Listing
            key={id}
            title={name}
            image={imageLink}
            price={price}
            id={id}
          />
        ))}
      </div>
    </span>
  );
};

export default UserOrders;
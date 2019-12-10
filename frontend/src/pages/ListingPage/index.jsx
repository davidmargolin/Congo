import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { EthereumContext } from "../../context/EthereumContext.jsx";

const getListing = id =>
  fetch(
    `https://congo-mart.herokuapp.com/listing/${encodeURIComponent(id)}`
  ).then(res => res.json());

const ListingPage = () => {
  const { listingID } = useParams();
  const [listingData, setListingData] = useState(null);
  const { chosenAccount, methods } = useContext(EthereumContext);
  const email = useRef();

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
        <img
          src={listingData.imageLink}
          style={{ width: 400, height: 400, objectFit: "contain" }}
        />
        <br />
        <div style={{ flex: 1, padding: 24 }}>
          <h3>{listingData.name}</h3>
          <p>{listingData.price / 1000000000000000000} ETH</p>
          <a href={`https://ropsten.etherscan.io/address/${listingData.owner}`}>
            View Seller Info
          </a>
          <p>{listingData.details}</p>
          <form
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              justifyContent: "space-evenly",
              maxWidth: 800,
              minHeight: 200
            }}
            onSubmit={event => {
              event.preventDefault();

              methods
                .createOrder(listingID, 1, "", email.current.value)
                .send({
                  from: chosenAccount,
                  value: listingData.price
                })
                .then(response => console.log(response));
            }}
          >
            <span>
              It is recommended to use a burner email and not your personal
              email. You can find one{" "}
              <a
                href="https://temp-mail.org/en/"
                rel="noopener noreferrer"
                target="_blank"
                style={{
                  textDecoration: "underline",
                  color: "blue"
                }}
              >
                here.
              </a>
            </span>
            <input
              id="buyerEmail"
              type="email"
              ref={email}
              placeholder="Your email address..."
              required
            />

            <div style={{ justifyContent: "flex-end", display: "flex" }}>
              <button
                style={{
                  color: "rbg(0, 0, 0)",
                  fontSize: 16,
                  backgroundColor: "#f9de9f",
                  padding: 6,
                  border: "1px solid black"
                }}
                type="submit"
              >
                Buy Now
              </button>
            </div>
          </form>
        </div>
      </div>
    </span>
  );
};

export default ListingPage;

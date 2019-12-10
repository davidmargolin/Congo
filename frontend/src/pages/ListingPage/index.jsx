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
    <div
      style={{
        flexDirection: "row",
        display: "flex",
        flexWrap: "wrap",
        flex: 1,
        justifyContent: "center"
      }}
    >
      <img
        src={listingData.imageLink}
        style={{
          padding: 12,
          maxWidth: 400,
          maxHeight: 400,
          objectFit: "contain"
        }}
      />
      <div style={{ padding: 12, maxWidth: 800 }}>
        <h3>{listingData.name}</h3>
        <p>{listingData.price / 1000000000000000000} ETH</p>

        <a
          href={`https://ropsten.etherscan.io/address/${listingData.owner}`}
          rel="noopener noreferrer"
          target="_blank"
        >
          <button>View Seller Info</button>
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
            It is recommended to use a burner email and not your personal email.
            You can find one{" "}
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

          <div style={{ justifyContent: "flex-end", display: "flex" }}>
            <input
              id="buyerEmail"
              type="email"
              ref={email}
              placeholder="Your email address..."
              required
            />
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
  );
};

export default ListingPage;

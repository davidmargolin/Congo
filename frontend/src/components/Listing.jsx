import React from "react";
import { Link } from "react-router-dom";

const Listing = ({ title, image, price, id }) => {
  return (
    <Link to={`/listing/${id}`}>
      <button
        style={{
          width: 300,
          margin: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          padding: 8,
          borderWidth: 1,
          borderColor: "lightgray",
          borderStyle: "solid",
          backgroundColor: "white"
        }}
      >
        <img
          src={image}
          alt={title}
          style={{ width: "100%", height: 200, objectFit: "cover" }}
        />
        <h2
          style={{
            marginTop: 4,
            marginBottom: 4,
            fontSize: 14,
            textAlign: "start",
            color: "black"
          }}
        >
          {title}
        </h2>
        <p style={{ margin: 0, color: "black" }}>
          {price / 1000000000000000000} ETH
        </p>
      </button>
    </Link>
  );
};

export default Listing;

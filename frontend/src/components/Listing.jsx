import React from "react";
import { Link } from "react-router-dom";

const Listing = ({ title, image, price }) => {
  return (
    <Link to={`/listing/${title}`}>
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
          style={{ width: "100%", height: 200, objectFit: "cover" }}
        />
        <h2 style={{ marginTop: 4, marginBottom: 4, fontSize: 14 }}>{title}</h2>
        <p style={{ margin: 0 }}>{"$" + price}</p>
      </button>
    </Link>
  );
};

export default Listing;

import React, { useState } from "react";
import Listing from "../../components/Listing";

const listings = new Array(24).fill(undefined).map((_, index) => {
  return {
    title: `Item ${index}`,
    image: "https://via.placeholder.com/400",
    price: 30
  };
});

const SearchResultPage = ({ query }) => {
  return (
    <div>
      <span
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          flexDirection: "column"
        }}
      >
        {query !== "" && (
          <p style={{ marginLeft: 8 }}>Results for "{query}":</p>
        )}

        <div
          style={{
            flexDirection: "row",
            display: "flex",
            flexWrap: "wrap",
            maxWidth: 1500,
            justifyContent: "center"
          }}
        >
          {listings.map(({ title, image, price }) => (
            <Listing title={title} image={image} price={price} />
          ))}
        </div>
      </span>
    </div>
  );
};

export default SearchResultPage;

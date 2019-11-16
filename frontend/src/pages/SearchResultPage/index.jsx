import React from "react";
import Listing from "../../components/Listing";
import { useParams } from "react-router-dom";

const listings = new Array(24).fill(undefined).map((_, index) => {
  return {
    title: `Item ${index}`,
    image: "https://via.placeholder.com/400",
    price: 30
  };
});

const SearchResultPage = () => {
  const { query } = useParams();

  return (
    <span
      style={{
        display: "flex",
        flex: 1,
        alignItems: "center",
        flexDirection: "column"
      }}
    >
      {query && query.trim() !== "" && (
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
  );
};

export default SearchResultPage;

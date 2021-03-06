import React, { useEffect, useState } from "react";
import Listing from "../../components/Listing";
import { useParams } from "react-router-dom";

const getSearchResults = query =>
  fetch(
    `https://congo-mart.herokuapp.com/search?query=${encodeURIComponent(query)}`
  ).then(res => res.json());

const SearchResultPage = () => {
  const { query } = useParams();
  const [listings, setListings] = useState([]);
  useEffect(() => {
    getSearchResults(query || "").then(({ results }) => {
      setListings(results);
    });
  }, [query]);
  return (
    <span
      style={{
        display: "flex",
        flex: 1,
        alignItems: "center",
        flexDirection: "column"
      }}
    >
      {query && query.trim() !== "" && <p>Results for "{query}":</p>}

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

export default SearchResultPage;

import React, { useState } from "react";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";

const SearchBar = ({ onSubmit }) => {
  const [query, setQuery] = useState("");

  return (
    <div
      style={{
        display: "flex",
        padding: 40,
        backgroundColor: "#c0c0c0",
        justifyContent: "center",
        alignItems: "center",
        flexWrap: "wrap"
      }}
    >
      <Link to="/">
        <img src={logo} style={{ height: 90, margin: 12 }} />
      </Link>
      <input
        type="text"
        style={{
          maxWidth: 1000,
          height: 40,
          flex: 1,
          fontSize: 20,
          padding: 12
        }}
        placeholder="Search for products..."
        onChange={e => {
          setQuery(e.target.value);
        }}
        onKeyPress={e => {
          if (e.keyCode == 13 || e.which === 13) {
            onSubmit(query);
          }
        }}
      />
    </div>
  );
};

export default SearchBar;

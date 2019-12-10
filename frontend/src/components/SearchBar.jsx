import React, { useState } from "react";
import logo from "../assets/logo.png";
import { Link, withRouter } from "react-router-dom";

const SearchBar = ({ history }) => {
  const [query, setQuery] = useState("");
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
        flexWrap: "wrap",
        flex: 1
      }}
    >
      <Link to="/">
        <img src={logo} alt="Congo Logo" style={{ height: 90, margin: 6 }} />
      </Link>
      <div
        style={{
          padding: 24,
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          maxWidth: 800,
          display: "flex"
        }}
      >
        <input
          type="text"
          style={{
            height: 20,
            flex: 1,
            fontSize: 16,
            padding: 14,
            borderStyle: "solid",
            borderColor: "black",
            borderWidth: 0,
            borderRadius: 20,
            boxShadow: "0px 0px 4px grey"
          }}
          placeholder="Search for products..."
          onChange={e => {
            setQuery(e.target.value);
          }}
          onKeyPress={e => {
            if (e.keyCode === 13 || e.which === 13) {
              history.push(`/search/${query}`);
            }
          }}
        />
      </div>
    </div>
  );
};

export default withRouter(SearchBar);

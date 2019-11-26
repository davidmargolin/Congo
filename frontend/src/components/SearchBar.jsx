import React, { useState } from "react";
import logo from "../assets/logo.png";
import account from "../assets/user.svg";
import { Link, withRouter } from "react-router-dom";

const SearchBar = ({ history }) => {
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
        <img src={logo} style={{ height: 90, margin: 6 }} />
      </Link>
      <div
        style={{
          display: "flex",
          flexWrap: "nowrap",
          justifyContent: "center",
          alignItems: "center",
          marginLeft: 20,
          maxWidth: 800,
          flex: 1
        }}
      >
        <input
          type="text"
          style={{
            height: 20,
            flex: 1,
            fontSize: 18,
            padding: 12
          }}
          placeholder="Search for products..."
          onChange={e => {
            setQuery(e.target.value);
          }}
          onKeyPress={e => {
            if (e.keyCode == 13 || e.which === 13) {
              history.push(`/search/${query}`);
            }
          }}
        />
        <Link to="/account">
          <img src={account} style={{ height: 50, margin: 12 }} />
        </Link>

        <Link to="/createListing">
          <span style={{
            height: 20,
            flex: 1,
            fontSize: 18,
            padding: 12
          }}>
            Create listing
          </span>
        </Link>
      </div>
    </div>
  );
};

export default withRouter(SearchBar);

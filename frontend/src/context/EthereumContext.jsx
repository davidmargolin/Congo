import React, { useState, useEffect } from "react";
import { abi } from "../assets/contract.json";
import Web3 from "web3";
import SearchBar from "../components/SearchBar";
import { Link } from "react-router-dom";

const CONTRACT_NETWORK_ID = 3;
const CONTRACT_ADDRESS = "0xD95F794BA7686bf0944b7Eb6fa7311BdeC762607";

export const EthereumContext = React.createContext();

const Ethereum = ({ children }) => {
  const [accounts, setAccounts] = useState([]);
  const [chosenAccount, setChosenAccount] = useState("Choose Account");
  const [isSameNetwork, setIsSameNetwork] = useState(true);
  const [isEthereumBrowser, setIsEthereumBrowser] = useState(true);
  const [methods, setMethods] = useState(null);
  useEffect(() => {
    setIsEthereumBrowser(window.ethereum !== undefined);
    if (window.ethereum !== undefined) {
      const web3 = new Web3(window.ethereum);
      web3.eth.net.getId().then(id => {
        setIsSameNetwork(id === CONTRACT_NETWORK_ID);
        if (id === CONTRACT_NETWORK_ID) {
          window.ethereum
            .enable()
            .then(() => {
              web3.eth.getAccounts().then(accs => {
                setAccounts(accs);
                setChosenAccount(accs.length > 0 ? accs[0] : null);
                const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
                setMethods(contract.methods);
              });
            })
            .catch(error => {
              console.log(error);
            });
        }
      });
    }
  }, []);

  if (!isEthereumBrowser) return <div> No web3 browser detected </div>;
  else if (!isSameNetwork)
    return (
      <div>
        Contract is not operating in this network, please change to the network
        with the id: {CONTRACT_NETWORK_ID}
      </div>
    );
  else if (!accounts.length)
    return (
      <div>
        Currently no accounts added to wallet, please have an account before
        making a listing
      </div>
    );
  else
    return (
      <EthereumContext.Provider
        value={{
          chosenAccount,
          methods
        }}
      >
        <div
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "flex-end",
            display: "flex",
            flexWrap: "wrap-reverse",
            margin: 2
          }}
        >
          <div
            style={{
              flexWrap: "wrap",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Link to="/createListing">
              <span
                style={{
                  fontSize: 16,
                  padding: 6
                }}
              >
                New Listing
              </span>
            </Link>
            <Link to="/orders">
              <span
                style={{
                  fontSize: 16,
                  padding: 6
                }}
              >
                Your Orders
              </span>
            </Link>
            <Link to="/listings">
              <span
                style={{
                  fontSize: 16,
                  padding: 6
                }}
              >
                Your Listings
              </span>
            </Link>
          </div>
          <select
            style={{
              display: "flex",
              flex: 1,
              maxWidth: 400,
              minWidth: 100,
              margin: 8
            }}
            onChange={event => setChosenAccount(event.target.value)}
          >
            {accounts.map(account => (
              <option value={account}>{account}</option>
            ))}
          </select>
        </div>
        <SearchBar />

        {children}
      </EthereumContext.Provider>
    );
};

export default Ethereum;

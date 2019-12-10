import React, { useState, useEffect } from "react";
import { abi, networks } from "../assets/contract.json";
import Web3 from "web3";
import SearchBar from "../components/SearchBar";
import { Link } from "react-router-dom";

const CONTRACT_NETWORK_ID = 3;
const CONTRACT_ADDRESS = networks[CONTRACT_NETWORK_ID].address;

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
            justifyContent: "space-between",
            display: "flex",
            paddingLeft: 20,
            paddingRight: 20,
            flexWrap: "wrap"
          }}
        >
          <div
            style={{
              flexWrap: "wrap",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: 12
            }}
          >
            <Link to="/docs">
              <span
                style={{
                  fontSize: 16,
                  padding: 6
                }}
              >
                Documentation
              </span>
            </Link>
            <a
              href={"https://ropsten.etherscan.io/address/" + CONTRACT_ADDRESS}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span
                style={{
                  fontSize: 16,
                  padding: 6
                }}
              >
                Etherscan
              </span>
            </a>
            <span style={{ width: 300 }}></span>
          </div>
          <div
            style={{
              flexWrap: "wrap-reverse",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: 12
            }}
          >
            <Link to="/create-listing">
              <span
                style={{
                  fontSize: 16,
                  padding: 6
                }}
              >
                New Listing
              </span>
            </Link>
            <Link to="/user/orders">
              <span
                style={{
                  fontSize: 16,
                  padding: 6
                }}
              >
                Your Orders
              </span>
            </Link>
            <Link to="/user/listings">
              <span
                style={{
                  fontSize: 16,
                  padding: 6
                }}
              >
                Your Listings
              </span>
            </Link>
            <select
              style={{ minWidth: 250, maxWidth: 300 }}
              onChange={event => setChosenAccount(event.target.value)}
            >
              {accounts.map(account => (
                <option value={account} key={account}>
                  {account.slice(0, 6) + "..." + account.slice(-6)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <SearchBar />

        {children}
      </EthereumContext.Provider>
    );
};

export default Ethereum;

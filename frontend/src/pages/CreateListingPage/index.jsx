import React, { useEffect, useState } from "react";
import { abi } from "../../assets/contract.json";
import Web3 from "web3";

//Ropsten address network
const CONTRACT_ADDRESS = "0xD95F794BA7686bf0944b7Eb6fa7311BdeC762607";
const CONTRACT_NETWORK = 3;

//Kendrick's local enviroment, ignore
//const CONTRACT_ADDRESS = "0x5Cf63b99F134B99F5260599f620fb26eA7d3bf91";
//const CONTRACT_NETWORK_ID = 5777;


const makeListing = (name, price, quantity, details, sellerEmail) => {
  const web3 = new Web3(window.ethereum);
  const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);

  web3.eth.getAccounts().then(accounts => {
    contract.methods.createListing(quantity, price, details, name, sellerEmail)
      .send({from: web3.currentProvider.selectedAddress || accounts[0]})
      .then(response => console.log(response))
      .catch(error => console.log(error))
  })
};

const CreateListingPage = () => {
  const [name, setName] = useState();
  const [price, setPrice] = useState();
  const [quantity, setQuantity] = useState();
  const [details, setDetails] = useState();
  const [sellerEmail, setSellerEmail] = useState();

  const [isEthereumBrowser, setIsEthereumBrowser] = useState(); 
  const [isSameNetwork, setIsSameNetwork] = useState();
  const [hasAccount, setHasAccount] = useState();

  useEffect(() => {
    if(window.ethereum === undefined) {
      setIsEthereumBrowser(true);
      return;
    }
    
    const web3 = new Web3(window.ethereum);
    web3.eth.net.getId().then(id => {
      if(id === CONTRACT_NETWORK_ID){ 
        setIsSameNetwork(true);
      }else{
        setIsSameNetwork(false);
      }
    })

    web3.eth.getAccounts().then(accounts => {
      if(accounts.length === 0){
        setHasAccount(false);
      }else{
        setHasAccount(true);
      }
    })

  }, [])

  if(isEthereumBrowser === false) return <div> No web3 browser detected </div>
  if(isSameNetwork === false) return <div> Contract is not operating in this network, please change to the network with the id: {CONTRACT_NETWORK_ID}</div>
  if(hasAccount === false) return <div> Currently no accounts added to wallet, please have an account before making a listing</div>

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        justifyContent: "center",

      }}
    >
      <form
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-evenly",
          maxWidth: 300,
          minHeight: 600,
          padding: "30px",
          border: "2px solid black"
        }}

        onSubmit={event => {
          event.preventDefault();

          const productPrice = new Web3(window.ethereum).utils.toWei(
            price.value.toString(),
            "Ether"
          );

          //ID will be auto generated in smart contract
          makeListing(
            name.value,
            productPrice,
            quantity.value,
            details.value,
            sellerEmail.value
          );
        }}
      >
        <span
          style={{
            fontSize: 16
          }}  
        >
          Creating a listing is easy! Just fill out the form and hit submit!

        </span>
        <input
          id="productName"
          type="text"
          ref={input => {
            setName(input);
          }}
          placeholder="Product name..."
          required
        />
        <input
          id="productPrice"
          type="text"
          ref={input => {
            setPrice(input);
          }}
          placeholder="Product price..."
          required
        />
        <input
          id="productQuantity"
          type="text"
          ref={input => {
            setQuantity(input);
          }}
          placeholder="Product quantity..."
          required
        />
        <input
          id="productDescription"
          type="text"
          ref={input => {
            setDetails(input);
          }}
          placeholder="Product description..."
          required
        />

        <span>
          It is reccomended to use a burner email and not your personal email. You can find one  
          <a href="https://temp-mail.org/en/" target="_blank"> here</a>
        </span>
        <input
          id="sellerEmail"
          type="text"
          ref={input => {
            setSellerEmail(input);
          }}
          placeholder="Your email address..."
          required
        />
        <button 
          style={{
            color: "rbg(0, 0, 0)",
            fontSize: "16px",
            fontFamily: "Times New Roman",
            backgroundColor: "#f9de9f",
            padding: "5px",
            border: "1px solid black"
          }}
          type="submit"> Submit product! </button>
      </form>
    </div>
    )
}


export default CreateListingPage;

/*
Key points:
  If web3 is not detected, return nothing -> done
  Check if user is on right network  ->  don't want users to access form if not connected to the proper block chain either -> done
  Check if user has an account on metamask/ethereum enhanced browser -> done

  Make these checks website wide or only when they open "create listings" and "look at listings" pages?

  Must refresh page if wallet is changed
  Should we display current contents of wallet?
  Check if email is vaild?

  Comfirmation page/reset form
  On rejection of transaction of metamask event?


  Set up account page drop down to select current wallet's listings, orders, ability to edit them?  --> Account page sets local storage for email default?

  This page needs to grab local storage data and insert it as a default into "Your email address" field
*/
import React, { useState, useRef, useContext } from "react";
import { abi } from "../../assets/contract.json";
import  { Redirect } from 'react-router-dom';
import Web3 from "web3";
import { EthereumContext } from "../../context/EthereumContext";
//Ropsten address network   ==> Change network address if we need to

//Kendrick's local enviroment, ignore
//const CONTRACT_ADDRESS = "0x5Cf63b99F134B99F5260599f620fb26eA7d3bf91";
//const CONTRACT_NETWORK_ID = 5777;

const makeListing = (
  name,
  price,
  quantity,
  details,
  sellerEmail,
  setConfirmation,
  accountInfo
) => {
  const web3 = new Web3(window.ethereum);
  const { CONTRACT_ADDRESS, chosenAccount } = accountInfo;

  const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
  console.log(quantity, price, details, name, sellerEmail, chosenAccount);
  // contract.methods
  //   .createListing(quantity, price, details, name, sellerEmail)
  //   .send({ from: chosenAccount })
  //   .then(response => {
  //     console.log(response);
  //     setConfirmation(true);
  //   })
  //   .catch(error => {
  //     console.log(error);
  //   });
};

const CreateListingPage = ({ history }) => {
  const name = useRef();
  const price = useRef();
  const quantity = useRef();
  const details = useRef();
  const email = useRef();
  const accountInfo = useContext(EthereumContext);
  const [confirmation, setConfirmation] = useState(false);

  if (confirmation) return <Redirect to="confirmationPage"></Redirect>;

  //const web3 = new Web3(window.ethereum);
  //console.log(new Web3(window.ethereum).utils.toWei("100", "Ether"));

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
            quantity.current.value,
            details.current.value,
            email.current.value,
            setConfirmation,
            accountInfo
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
          <a href="https://temp-mail.org/en/" rel="noopener noreferrer" target="_blank"> here.</a>
        </span>
        <input
          id="sellerEmail"
          type="email"
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
  Check if user is on right network ->   don't want users to access form if not connected to the proper block chain either  -> done
  Check if user has an account on metamask/ethereum enhanced browser  -> done

  Make these checks website wide or only when they open "create listings" and "look at listings" pages?

  Must refresh page if wallet account is changed -> not needed since account check is applied during transaction?
  Should we display current contents of wallet?
  Check if email is vaild? -> done

  Comfirmation page/reset form -> still needs formating -> done for now
  On rejection of transaction of metamask event? -> stay on page -> done


  Set up account page drop down to select current wallet's listings, orders, ability to edit them?  --> Account page sets local storage for email default?

  This page needs to grab local storage data and insert it as a default into "Your email address" field
*/
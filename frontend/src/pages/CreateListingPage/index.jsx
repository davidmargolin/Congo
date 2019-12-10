import React, { useState, useRef, useContext } from "react";
import { Redirect } from "react-router-dom";
import Web3 from "web3";
import { EthereumContext } from "../../context/EthereumContext";

//Kendrick's local enviroment, ignore
//const CONTRACT_ADDRESS = "0x5Cf63b99F134B99F5260599f620fb26eA7d3bf91";
//const CONTRACT_NETWORK_ID = 5777;

const makeListing = (
  name,
  price,
  quantity,
  details,
  imageURL,
  sellerEmail,
  setConfirmation,
  accountInfo
) => {
  const { chosenAccount, methods } = accountInfo;

  methods
    .createListing(quantity, price, details, name, imageURL, sellerEmail)
    .send({ from: chosenAccount })
    .then(response => {
      console.log(response);
      setConfirmation(true);
    })
    .catch(error => {
      console.log(error);
    });
};

const CreateListingPage = () => {
  const name = useRef();
  const price = useRef();
  const quantity = useRef();
  const image = useRef();
  const details = useRef();
  const email = useRef();
  const accountInfo = useContext(EthereumContext);
  const [confirmation, setConfirmation] = useState(false);

  if (confirmation) return <Redirect to="confirmation-page"></Redirect>;

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        justifyContent: "center"
      }}
    >
      <form
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-evenly",
          maxWidth: 800,
          minHeight: 600,
          padding: 12
        }}
        onSubmit={event => {
          event.preventDefault();

          const productPrice = new Web3(window.ethereum).utils.toWei(
            price.current.value.toString(),
            "Ether"
          );

          //ID will be auto generated in smart contract
          makeListing(
            name.current.value,
            productPrice,
            quantity.current.value,
            details.current.value,
            image.current.value,
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
          ref={name}
          placeholder="Product name..."
          required
        />
        <input
          id="productImage"
          type="url"
          ref={image}
          placeholder="Link to product image..."
          required
        />
        <span
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap"
          }}
        >
          <input
            style={{ display: "flex", flex: 1 }}
            id="productPrice"
            min={0}
            type="text"
            ref={price}
            placeholder="Product price (in Ether)..."
            required
          />
          <input
            style={{
              display: "flex",
              flex: 1,
              marginTop: 12,
              marginBottom: 12
            }}
            id="productQuantity"
            type="number"
            min={0}
            ref={quantity}
            placeholder="Product quantity..."
            required
          />
        </span>

        <textarea
          id="productDescription"
          type="text"
          rows="5"
          ref={details}
          placeholder="Product description..."
          required
        />

        <span>
          It is recommended to use a burner email and not your personal email.
          You can find one{" "}
          <a
            href="https://temp-mail.org/en/"
            rel="noopener noreferrer"
            target="_blank"
            style={{
              textDecoration: "underline",
              color: "blue"
            }}
          >
            here.
          </a>
        </span>

        <div style={{ display: "flex" }}>
          <input
            id="sellerEmail"
            type="email"
            ref={email}
            style={{ marginRight: 12, flex: 1 }}
            placeholder="Your email address..."
            required
          />
          <button type="submit">Submit Product</button>
        </div>
      </form>
    </div>
  );
};

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

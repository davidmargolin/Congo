import React, { useState } from "react";

const AddProduct = props => {
  const [name, setName] = useState();
  const [price, setPrice] = useState();
  const [quantity, setQuantity] = useState();
  const [description, setDescription] = useState();
  const [email, setEmail] = useState();

  return (
    <div>
      <form
        onSubmit={event => {
          //console.log("SUBMIT FORM WORKS");
          event.preventDefault();

          const productPrice = window.web3.utils.toWei(
            price.value.toString(),
            "Ether"
          );

          //ID will be auto generated in smart contract
          props.createListing(
            name.value,
            productPrice,
            quantity.value,
            description.value,
            email.value
          );
        }}
      >
        <input
          id="productName"
          type="text"
          ref={input => {
            setName(input);
          }}
          className="form-control"
          placeholder="Product Name"
          required
        />
        <input
          id="productPrice"
          type="text"
          ref={input => {
            setPrice(input);
          }}
          className="form-control"
          placeholder="Product Price"
          required
        />
        <input
          id="productQuantity"
          type="text"
          ref={input => {
            setQuantity(input);
          }}
          className="form-control"
          placeholder="Product Quantity"
          required
        />
        <input
          id="productDescription"
          type="text"
          ref={input => {
            setDescription(input);
          }}
          className="form-control"
          placeholder="Product Description"
          required
        />
        <input
          id="sellerEmail"
          type="text"
          ref={input => {
            setEmail(input);
          }}
          className="form-control"
          placeholder="Your Email"
          required
        />
        <button type="submit">Add Product</button>
      </form>
    </div>
  );
};

export default AddProduct;

/* Variables accessable in createProduct
  createProduct
		uint id,
		uint quantity,
		uint price,
		string details,
		string name,
    address payable owner
    
*/
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
      <h2>List of products</h2>
      <table>
        <thead>
          <tr>
            <th scope="col">Product #</th>
            <th scope="col">Name</th>
            <th scope="col">Price </th>
            <th scope="col">Quantity</th>
            <th scope="col">Description</th>
            <th scope="col">Seller Email</th>
          </tr>
        </thead>
        <tbody id="productList">
          {props.products.map((product, key) => {
            return (
              <tr key={key}>
                <th>{product.id.toString()}</th>
                <td>{product.name}</td>
                <td>
                  {window.web3.utils.fromWei(product.price.toString(), "Ether")}
                </td>
                <td>{product.quantity}</td>
                <td>{product.details}</td>
                <td>{product.sellerContactDetails}</td>
                <td>
                  {//possibly create condition to prevent showing the listings user has made
                  product.quantity > 0 ? (
                    <button
                      onClick={e => {
                        //TEMP PURCHASE QUANTITY OF ONE PER BUY, NEEDS TO BE HOOKED UP WITH CART
                        let tmpQuantity = 1;
                        let tmpMsg = "Ship fast plz";
                        let tmpMail = "Purchaser69@mail.com";
                        props.createOrder(
                          product.id,
                          product.price,
                          tmpQuantity,
                          tmpMsg,
                          tmpMail
                        );
                      }}
                    >
                      Buy
                    </button>
                  ) : (
                    <div>Purchase is unavailable</div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
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

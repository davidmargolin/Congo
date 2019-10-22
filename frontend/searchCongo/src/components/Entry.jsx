import React, { Component } from "react";
import "./../stylesheets/Entry.css";

function makeEntry(title, description, image, sellerID, price, quantity) {
  return {
    title: title,
    description: description,
    image: image, //will be url temp until back end creates database to pull and upload images?
    sellerID: sellerID,
    price: price,
    quantity: quantity
  };
}

let a = new makeEntry(
  "Kittens",
  "Knowing how to write a paragraph is incredibly important. It’s a basic aspect of writing, and it is something that everyone should know how to do. There is a specific structure that you have to follow when you’re writing a paragraph. This structure helps make it easier for the reader to understand what is going on. Through writing good paragraphs, a person can communicate a lot better through their writing.",
  "https://i.redd.it/x0ed0ctmf4531.jpg",
  "aaaaa",
  10,
  10,
  1
);

//Idea: Pass entry into component and render information for specific item

class Entry extends Component {
  render() {
    return (
      <div className="Sale-page">
        <img
          src={a.image}
          alt=""
          width="auto"
          height="400"
          style={{ marginLeft: 40 }}
        ></img>

        <div className="Sale-info-column">
          <h1 style={{ lineHeight: 0 }}>{a.title}</h1>
          <p style={{ lineHeight: 0 }}> by: {a.sellerID}</p>
          <br></br>
          <p>{a.description}</p>
          <br></br>
          <p>Quantity Available {a.quantity}</p>
        </div>

        <div className="Buy-column">
          <button className="myButton" type="button">
            Buy
          </button>
          <p>${a.price}</p>
        </div>
      </div>
    );
  }
}

export default Entry;

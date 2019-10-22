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
  "Selling many kittens",
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
      <div className="Container">
        <h1> Search bar temp</h1>

        <div className="Sale-page">
          <img src={a.image} alt="" width="auto" height="400"></img>

          <div className="Sale-info-column">
            <h1>{a.title}</h1>
            <br></br>
            <p>{a.description}</p>
          </div>

          <div className="Buy-column">
            <button className="myButton" type="button">
              Buy
            </button>
            <p>
              {a.sellerID}
              <br></br>
              {a.price}
              <br></br>
              {a.quantity}
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default Entry;

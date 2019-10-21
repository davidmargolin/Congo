import React, { Component } from "react";
import "./../App.css";

/* To do

  ability to upload images to database?

*/

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

function searchEntries(entries, searchWord) {
  let i = 0;
  let validEntries = [];

  while (i < entries.length) {
    if (entries[i].title.toLowerCase().includes(searchWord.toLowerCase()))
      validEntries.push(entries[i]);
    i++;
  }

  return validEntries;
}

function displayEntry(prop) {
  return (
    <div>
      <h1>{prop.title}</h1>
      <img src={prop.image} alt="" width="auto" height="400"></img>
      <p>
        description: {prop.description}
        <br></br>
        sellerID: {prop.sellerID}
        <br></br>
        Price: ${prop.price}
        <br></br>
        Quantity: {prop.quantity}
      </p>
      <div className="Entry-divider" />
    </div>
  );
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

let b = new makeEntry(
  "Dogs",
  "Selling all the dogs",
  "https://i.redd.it/pzl326ta6uoy.jpg",
  "bbbbbb",
  20,
  20,
  1
);

let c = new makeEntry(
  "Penguin",
  "Selling penguin egg holder",
  "https://i.redd.it/8uf94pa4p6p31.jpg",
  "ccccc",
  100,
  1,
  1
);

let entryList = [];
entryList[0] = a;
entryList[1] = b;
entryList[2] = c;

//let entries = entryList.map(entry => displayEntry(entry));

class List extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: ""
    };

    this.searchChange = this.searchChange.bind(this);
  }

  searchChange(event) {
    this.setState({
      search: event.target.value
    });
  }

  render() {
    return (
      <div className="App">
        <div className="Search-Header">
          <input
            type="text"
            style={{ height: 60, width: 1000, fontSize: 20 }}
            placeholder="Search Congo..."
            onChange={e => {
              this.searchChange(e);
            }}
          />
        </div>
        <header className="App-header">
          {searchEntries(entryList, this.state.search).map(entry =>
            displayEntry(entry)
          )}
        </header>
      </div>
    );
  }
}

export default List;

import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { EthereumContext } from "../../context/EthereumContext.jsx";

const getListing = (id, address) =>
  fetch(
    `https://congo-mart.herokuapp.com/listing/${encodeURIComponent(
      id
    )}?address=${encodeURIComponent(address)}`
  ).then(res => res.json());

const ListingPage = () => {
  const { listingID } = useParams();
  const [listingData, setListingData] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [ordersVisible, setOrdersVisible] = useState(false);
  const { chosenAccount, methods } = useContext(EthereumContext);
  const email = useRef();

  useEffect(() => {
    getListing(listingID, chosenAccount).then(({ listing, orders }) => {
      setListingData(listing);
      setUserOrders(orders);
    });
  }, [listingID, chosenAccount]);

  if (!listingData) return <div></div>;
  return (
    <div
      style={{
        flexDirection: "row",
        display: "flex",
        flexWrap: "wrap",
        flex: 1,
        justifyContent: "center"
      }}
    >
      <div style={{ padding: 8 }}>
        <img
          src={listingData.imageLink}
          alt={listingData.name}
          style={{
            width: "100%",
            maxWidth: 400,
            height: "auto",
            objectFit: "contain"
          }}
        />
      </div>

      <div style={{ width: "100%", maxWidth: 800 }}>
        {userOrders.length > 0 && (
          <div
            style={{
              alignItems: "center",
              display: "flex",
              flex: 1,
              padding: 12,
              flexDirection: "column"
            }}
          >
            <button
              style={{
                width: "100%",
                textAlign: "start",
                maxWidth: 800
              }}
              onClick={() => {
                setOrdersVisible(!ordersVisible);
              }}
            >
              {userOrders.length === 1
                ? "1 Existing Order"
                : `${userOrders.length} Existing Orders`}
            </button>
            {ordersVisible && (
              <div
                style={{
                  maxWidth: 800,
                  width: "100%",
                  overflowX: "auto"
                }}
              >
                <table style={{ minWidth: 800 }}>
                  <tr>
                    <th>Order ID</th>
                    <th>Status</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Seller Email</th>
                    <th>Date</th>
                  </tr>
                  {userOrders.map(
                    ({
                      orderStatus,
                      total,
                      orderID,
                      sellerContactDetails: email,
                      quantity,
                      listingTimestamp
                    }) => (
                      <tr>
                        <td>{orderID}</td>
                        <td>{orderStatus}</td>
                        <td>{total / 1000000000000000000} ETH</td>
                        <td>{quantity}</td>
                        <td>{email}</td>
                        <td>{listingTimestamp}</td>
                      </tr>
                    )
                  )}
                </table>
              </div>
            )}
          </div>
        )}
        <div
          style={{
            display: "flex",
            flex: 1,
            paddingLeft: 12,
            paddingRight: 12,
            margin: 8,
            flexDirection: "column"
          }}
        >
          <h3>{listingData.name}</h3>
          <p>
            {listingData.price / 1000000000000000000} ETH (
            {listingData.quantity} in stock)
          </p>

          <a
            href={`https://ropsten.etherscan.io/address/${listingData.owner}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            <button>View Seller Info</button>
          </a>

          <p>{listingData.details}</p>
          <form
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              justifyContent: "space-evenly",
              maxWidth: 800,
              marginTop: 30,
              marginBottom: 30
            }}
            onSubmit={event => {
              event.preventDefault();

              methods
                .createOrder(listingID, 1, "", email.current.value)
                .send({
                  from: chosenAccount,
                  value: listingData.price
                })
                .then(response => console.log(response));
            }}
          >
            <div style={{ display: "flex" }}>
              <input
                id="buyerEmail"
                type="email"
                style={{ marginRight: 12 }}
                ref={email}
                placeholder="Your email address..."
                required
              />
              <button type="submit">Buy Now</button>
            </div>
            <span style={{ fontSize: 12 }}>
              *It is recommended to use a burner email and not your personal
              email. You can find one{" "}
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
          </form>
        </div>
      </div>
    </div>
  );
};

export default ListingPage;

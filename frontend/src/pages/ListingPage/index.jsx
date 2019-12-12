import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { EthereumContext } from "../../context/EthereumContext.jsx";

const STATUSES = ["Processing", "Shipped", "Refunded", "Canceled"];
const getListing = (id, address) =>
  fetch(
    `https://congo-mart.herokuapp.com/listing/${encodeURIComponent(
      id
    )}?address=${encodeURIComponent(address)}`
  ).then(res => res.json());

const UserOrders = ({ orders }) => {
  const [ordersVisible, setOrdersVisible] = useState(true);
  const { chosenAccount, methods, handleEvent } = useContext(EthereumContext);

  const cancelOrder = id => {
    methods
      .updateOrder(id, 3)
      .send({
        from: chosenAccount
      })
      .on("transactionHash", hash => {
        handleEvent();
      });
  };

  return (
    orders.length > 0 && (
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
          {orders.length === 1
            ? "1 Existing Order"
            : `${orders.length} Existing Orders`}
        </button>
        {ordersVisible && (
          <div
            style={{
              maxWidth: 800,
              width: "100%",
              overflowX: "auto"
            }}
          >
            <table style={{ minWidth: 900 }}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Seller Email</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map(
                  ({
                    orderStatus,
                    total,
                    orderID,
                    sellerContactDetails: email,
                    quantity,
                    listingTimestamp
                  }) => (
                    <tr key={orderID}>
                      <td>{orderID}</td>
                      <td>{STATUSES[orderStatus]}</td>
                      <td>{total / 1000000000000000000} ETH</td>
                      <td>{quantity}</td>
                      <td>{email}</td>
                      <td>{listingTimestamp}</td>
                      <td>
                        {orderStatus === 0 && (
                          <button onClick={() => cancelOrder(orderID)}>
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  );
};

const SellerOrders = ({ orders }) => {
  const [ordersVisible, setOrdersVisible] = useState(true);
  const { chosenAccount, methods, handleEvent } = useContext(EthereumContext);

  const updateOrderStatus = (id, status) => {
    methods
      .updateOrder(id, status)
      .send({
        from: chosenAccount
      })
      .on("transactionHash", hash => {
        handleEvent();
      });
  };
  return (
    orders.length > 0 && (
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
          {orders.length === 1 ? "1 Order" : `${orders.length} Orders`}
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
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Buyer Email</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(
                  ({
                    orderStatus,
                    total,
                    orderID,
                    buyerContactDetails: email,
                    quantity,
                    listingTimestamp
                  }) => (
                    <tr key={orderID}>
                      <td>{orderID}</td>
                      <td>
                        <select
                          defaultValue={orderStatus}
                          onChange={e =>
                            orderStatus !== parseInt(e.target.value) &&
                            updateOrderStatus(orderID, e.target.value)
                          }
                        >
                          <option key={orderStatus} value={orderStatus}>
                            {STATUSES[orderStatus]}
                          </option>
                          {orderStatus === 0 && (
                            <>
                              <option key={1} value={1}>
                                Ship
                              </option>
                              <option key={2} value={2}>
                                Refund
                              </option>
                            </>
                          )}
                        </select>
                      </td>
                      <td>{total / 1000000000000000000} ETH</td>
                      <td>{quantity}</td>
                      <td>{email}</td>
                      <td>{listingTimestamp}</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  );
};

const Purchase = ({ listingID, price, sellerAddress, quantity }) => {
  const { chosenAccount, methods, handleEvent } = useContext(EthereumContext);
  const email = useRef();
  const makePurchase = () => {
    methods
      .createOrder(listingID, 1, "", email.current.value)
      .send({
        from: chosenAccount,
        value: price
      })
      .on("transactionHash", hash => {
        handleEvent();
      });
  };
  if (sellerAddress === chosenAccount)
    return "Purchasing is disabled on owned listings.";
  else if (quantity === 0) return "None in stock.";
  else
    return (
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
          makePurchase();
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
          *It is recommended to use a burner email and not your personal email.
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
      </form>
    );
};

const ListingPage = () => {
  const { listingID } = useParams();
  const [listingData, setListingData] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const { chosenAccount } = useContext(EthereumContext);

  useEffect(() => {
    getListing(listingID, chosenAccount).then(
      ({ listing, ordersBought, ordersSold }) => {
        setListingData(listing);
        setUserOrders(ordersBought);
        setSellerOrders(ordersSold);
      }
    );
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
        <UserOrders orders={userOrders} />
        <SellerOrders orders={sellerOrders} />

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
          <Purchase
            listingID={listingID}
            price={listingData.price}
            sellerAddress={listingData.owner}
            quantity={listingData.quantity}
          />
        </div>
      </div>
    </div>
  );
};

export default ListingPage;

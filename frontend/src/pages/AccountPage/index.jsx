import React, { useEffect, useState } from "react";
import firebase from "firebase";
import * as firebaseui from "firebaseui";
import { Link } from "react-router-dom";
import wallet from "../../assets/dollar-sign.svg";
import logOut from "../../assets/log-out.svg";
import orders from "../../assets/shopping-bag.svg";

let ui = null;

const AccountPage = ({ user }) => {
  const [tab, setTab] = useState("Wallet");
  useEffect(() => {
    if (!user) {
      if (!ui) {
        ui = new firebaseui.auth.AuthUI(firebase.auth());
      }
      ui.start("#firebaseui-auth-container", {
        signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
        signInFlow: "popup",
        callbacks: {
          signInSuccessWithAuthResult: function(authResult, redirectUrl) {
            return false;
          }
        }
      });
    }
  }, [user]);
  return (
    <span
      style={{
        display: "flex",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column"
      }}
    >
      {user && (
        <div
          style={{
            flexDirection: "row",
            display: "flex",
            flexWrap: "wrap",
            maxWidth: 1500,
            padding: 24,
            justifyContent: "flex-start",
            flex: 1
          }}
        >
          <div style={{ flexDirection: "column", margin: 20 }}>
            Welcome {user.displayName}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderStyle: "solid",
                borderRadius: 15,
                borderColor: "black",
                padding: 12,
                cursor: "pointer",
                margin: 8
              }}
              onClick={() => setTab("Orders")}
            >
              <img src={orders} style={{ height: 30, marginRight: 12 }} />
              <span>View Orders</span>
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                margin: 8,
                cursor: "pointer",
                alignItems: "center",
                borderWidth: 1,
                borderStyle: "solid",
                borderRadius: 15,
                borderColor: "black",
                padding: 12
              }}
              onClick={() => setTab("Wallet")}
            >
              <img src={wallet} style={{ height: 30, marginRight: 12 }} />
              <span>Manage Wallet</span>
            </div>
            <div
              onClick={() => firebase.auth().signOut()}
              style={{
                cursor: "pointer",
                flex: 1,
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                margin: 8,
                borderWidth: 1,
                borderStyle: "solid",
                borderRadius: 15,
                borderColor: "black",
                padding: 12
              }}
            >
              <img src={logOut} style={{ height: 30, marginRight: 12 }} />
              <span>Log Out</span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flex: 1,
              minWidth: 200,
              flexDirection: "column"
            }}
          >
            <h2>Your {tab}</h2>
            <h2>Your {tab}</h2>
            <h2>Your {tab}</h2>
            <h2>Your {tab}</h2>
            <h2>Your {tab}</h2>
            <h2>Your {tab}</h2>
            <h2>Your {tab}</h2>
          </div>
        </div>
      )}

      {!user && <div id="firebaseui-auth-container" />}
    </span>
  );
};

export default AccountPage;

import React, { useEffect, useState } from "react";
import SearchResults from "./pages/SearchResultPage";
import Listing from "./pages/ListingPage";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import SearchBar from "./components/SearchBar";
<<<<<<< HEAD
<<<<<<< HEAD
import MetaMask from "./components/MetaMask";
=======
=======
>>>>>>> Fixes to compile warnings and small fixes
import Account from "./pages/AccountPage";
import Cart from "./pages/CartPage";
import firebase from "firebase/app";
import "firebase/auth";
<<<<<<< HEAD
>>>>>>> cart
=======
>>>>>>> Fixes to compile warnings and small fixes

const App = () => {
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState(false);
  useEffect(() => {
    const firebaseConfig = {
      apiKey: "AIzaSyAsPYKFR04z2XldchYV5H43R_wilp9SaV4",
      authDomain: "congo-e1410.firebaseapp.com",
      databaseURL: "https://congo-e1410.firebaseio.com",
      projectId: "congo-e1410",
      storageBucket: "congo-e1410.appspot.com",
      messagingSenderId: "914496451049",
      appId: "1:914496451049:web:7e7facf4cb56b8810e5b78",
      measurementId: "G-VG6NS53DMG"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        setUser(null);
      } else {
        setUser(user);
      }
    });
    setInitialized(true);
  }, []);

  if (!initialized) {
    return <div></div>;
  }

  return (
    <div>
      <Router>
<<<<<<< HEAD
        <MetaMask />
=======
>>>>>>> Fixes to compile warnings and small fixes
        <SearchBar />

        <Switch>
          <Route exact path="/listing/:listingID">
            <Listing />
          </Route>
          <Route exact path="/search/:query">
            <SearchResults />
          </Route>
          <Route exact path="/account">
            <Account user={user} />
          </Route>
          <Route exact path="/cart">
            <Cart />
          </Route>
          <Route path="/">
            <SearchResults />
          </Route>
        </Switch>
      </Router>
    </div>
  );
};

export default App;

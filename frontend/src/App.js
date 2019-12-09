import React from "react";
import SearchResults from "./pages/SearchResultPage";
import Listing from "./pages/ListingPage";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Cart from "./pages/CartPage";
import CreateListing from "./pages/CreateListingPage";
import ConfirmationPage from "./pages/CreateListingPage/confirmation";
import Ethereum from "./context/EthereumContext";
import './assets/globalStyles.css'
const App = () => {
  return (
    <div>
      <Router>
        <Ethereum>
          <Switch>
            <Route exact path="/listing/:listingID">
              <Listing />
            </Route>
            <Route exact path="/search/:query">
              <SearchResults />
            </Route>
            <Route exact path="/cart">
              <Cart />
            </Route>
            <Route exact path="/createListing">
              <CreateListing />
            </Route>
            <Route exact path="/confirmationPage">
              <ConfirmationPage />
            </Route>
            <Route path="/">
              <SearchResults />
            </Route>
          </Switch>
        </Ethereum>
      </Router>
    </div>
  );
};

export default App;

import React from "react";
import SearchResults from "./pages/SearchResultPage";
import Listing from "./pages/ListingPage";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import CreateListing from "./pages/CreateListingPage";
import UserListings from "./pages/UserListings";
import ConfirmationPage from "./pages/CreateListingPage/confirmation";
import Ethereum from "./context/EthereumContext";
import "./assets/globalStyles.css";
import UserOrders from "./pages/UserOrders";
import Docs from "./pages/Docs";

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
            <Route exact path="/user/listings">
              <UserListings />
            </Route>
            <Route exact path="/user/orders">
              <UserOrders />
            </Route>
            <Route exact path="/create-listing">
              <CreateListing />
            </Route>
            <Route exact path="/confirmation-page">
              <ConfirmationPage />
            </Route>
            <Route path="/docs">
              <Docs />
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

import React from "react";
import SearchResults from "./pages/SearchResultPage";
import Listing from "./pages/ListingPage";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import SearchBar from "./components/SearchBar";
import MetaMask from "./components/MetaMask";

const App = () => {
  return (
    <div>
      <Router>
        <MetaMask />
        <SearchBar />

        <Switch>
          <Route exact path="/listing/:listingID">
            <Listing />
          </Route>
          <Route exact path="/search/:query">
            <SearchResults />
          </Route>
          <Route exact path="/">
            <SearchResults />
          </Route>
        </Switch>
      </Router>
    </div>
  );
};

export default App;

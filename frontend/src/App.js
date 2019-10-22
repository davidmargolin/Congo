import React, { useState } from "react";
import SearchResults from "./pages/SearchResultPage";
import Listing from "./pages/ListingPage";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import SearchBar from "./components/SearchBar";

const App = () => {
  const [query, setQuery] = useState("");
  return (
    <div>
      <Router>
        <SearchBar onSubmit={newQuery => setQuery(newQuery)} />

        <Switch>
          <Route path="/listing/:listingID">
            <Listing />
          </Route>
          <Route path="/">
            <SearchResults query={query} />
          </Route>
        </Switch>
      </Router>
    </div>
  );
};

export default App;

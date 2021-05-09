import React from "react";
import "./App.scss";
import Home from "./containers/Home/Home";
import { Switch, Route } from "react-router-dom";
import "./containers/Home/Home";
import Navbar from "./containers/Navbar/Navbar";

function App() {
  return (
    <div className="app">
      <Navbar />
      <Switch>
        <Route>
          <Home />
        </Route>
      </Switch>
    </div>
  );
}

export default App;

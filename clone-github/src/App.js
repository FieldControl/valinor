import React from "react";
import "./App.scss";
import Home from "./containers/Home/Home";
import { Switch, Route } from "react-router-dom";
import "./containers/Home/Home";

function App() {
  return (
    <div className="app">
      <h1 className="app__title">Github Clone</h1>
      <Switch>
        <Route>
          <Home />
        </Route>
      </Switch>
    </div>
  );
}

export default App;

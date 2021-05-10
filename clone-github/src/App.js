import React, { Suspense, lazy } from "react";
import "./App.scss";
import { Switch, Route } from "react-router-dom";
import "./containers/Home/Home";
import Navbar from "./containers/Navbar/Navbar";

const AsyncHome = lazy(() => import("./containers/Home/Home"));
function App() {
  return (
    <div className="app">
      <Navbar />
      <Suspense fallback={<div>Loading...</div>}>
        <Switch>
          <Route>
            <AsyncHome />
          </Route>
        </Switch>
      </Suspense>
    </div>
  );
}

export default App;

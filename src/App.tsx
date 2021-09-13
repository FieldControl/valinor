import React from "react";
import "./App.css";
import Header from "./components/Header";
import GlobalState from "./global/GlobalState";
import RepositioriesList from "./screens/RepositoriesList";

function App() {
  return (
    <GlobalState>
      <Header />
      <RepositioriesList />
    </GlobalState>
  );
}

export default App;

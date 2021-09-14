import React from "react";
import "./App.css";
import Footer from "./components/Footer";
import Header from "./components/Header";
import GlobalState from "./global/GlobalState";
import RepositioriesList from "./screens/RepositoriesList";

function App() {
  return (
    <GlobalState>
      <Header />
      <RepositioriesList />
      <Footer />
    </GlobalState>
  );
}

export default App;

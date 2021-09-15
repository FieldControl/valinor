import React from "react";
import "./App.css";
import Footer from "./components/Footer";
import Header from "./components/Header";
import GlobalState from "./global/GlobalState";
import RepositioriesList from "./RepositoriesList";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100vh;
`;

function App() {
  return (
    <GlobalState>
      <Container>
        <Header />
        <RepositioriesList />
        <Footer />
      </Container>
    </GlobalState>
  );
}

export default App;

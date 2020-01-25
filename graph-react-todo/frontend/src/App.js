import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";
import Dashboard from "./pages/Dashboard";
import NewTodo from "./components/NewTodo";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Container>
        <Row className="pt-4">
          <Col>
            <a href="/">
              <img src="logo.png" className="logo" alt="React Todo" />
            </a>
          </Col>
        </Row>
        <Row className="pt-4">
          <Col>
            <Switch>
              <Route path="/novo">
                <NewTodo />
              </Route>
              <Route path="/">
                <Dashboard />
              </Route>
            </Switch>
          </Col>
        </Row>
      </Container>
    </BrowserRouter>
  );
}

export default App;

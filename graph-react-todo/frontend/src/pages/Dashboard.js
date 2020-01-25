import React, { Component } from "react";
import TodoList from "../components/TodoList";
import Navigation from "../components/Navigation";

class Dashboard extends Component {
  render() {
    return (
      <>
        <TodoList />
        <Navigation />
      </>
    );
  }
}

export default Dashboard;

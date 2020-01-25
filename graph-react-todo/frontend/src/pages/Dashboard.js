import React, { Component } from "react";
import TodoList from "../components/TodoList";
import Navigation from "../components/Navigation";
import service from "../services/api";

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      todos: []
    };
  }

  componentDidMount() {
    const payload = {
      query: `
        query {
          todos {
            _id
            description
            date
            completed
          }
        }
      `
    };
    service()
      .post("/graphql", payload)
      .then(res => {
        this.setState({ todos: res.data.data.todos });
      });
  }

  render() {
    return (
      <>
        <TodoList todos={this.state.todos} />
        <Navigation />
      </>
    );
  }
}

export default Dashboard;

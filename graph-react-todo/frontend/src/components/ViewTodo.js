import React, { Component } from "react";
import { Button, Card, CardTitle, CardText, Alert } from "reactstrap";
import service from "../services/api";

class ViewTodo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      todo: {},
      visible: false
    };
  }

  backHandler = () => {
    window.location = "/";
  };

  updateTodo = () => {
    const id = window.location.pathname.replace("/", "");
    const payload = {
      query: `
        mutation {
          updateTodo(id: "${id}") {
            _id
            date
            description
            completed
          }
        }
      `
    };
    // chamar api backend
    service()
      .post("/graphql", payload)
      .then(res => {
        this.setState({ visible: true, todo: res.data.data.updateTodo });
      });
  };

  removeTodo = () => {
    const id = window.location.pathname.replace("/", "");
    const payload = {
      query: `
        mutation {
          removeTodo(id: "${id}")
        }
      `
    };
    // chamar api backend
    service()
      .post("/graphql", payload)
      .then(() => {
        window.location = "/";
      });
  };

  componentDidMount() {
    const id = window.location.pathname.replace("/", "");
    const payload = {
      query: `
        query {
          getTodo(id: "${id}") {
            _id
            description
            date
            completed
          }
        }
      `
    };
    // chamar api backend
    service()
      .post("/graphql", payload)
      .then(res => {
        this.setState({ todo: res.data.data.getTodo });
      });
  }

  render() {
    return (
      <Card body>
        <CardTitle>
          <strong>Atividade</strong>
        </CardTitle>
        <CardText>
          <Alert color="success" isOpen={this.state.visible}>
            Atividade concluída com sucesso!
          </Alert>
        </CardText>
        <CardText>{this.state.todo.description}</CardText>
        <CardText>Data: {this.state.todo.date}</CardText>
        <CardText>
          Finalizado: {this.state.todo.completed ? "Sim" : "Não"}
        </CardText>
        <Button color="success" className="ml-2 mt-3" onClick={this.updateTodo}>
          Marcar como concluído
        </Button>
        <Button color="danger" className="ml-2 mt-3" onClick={this.removeTodo}>
          Remover
        </Button>
        <Button className="ml-2 mt-3" onClick={this.backHandler}>
          Voltar
        </Button>
      </Card>
    );
  }
}

export default ViewTodo;

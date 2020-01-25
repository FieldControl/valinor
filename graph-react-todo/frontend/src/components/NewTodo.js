import React, { Component } from "react";
import { Button, Form, FormGroup, Label, Input, Alert } from "reactstrap";
import service from "../services/api";

class NewTodo extends Component {
  constructor(props) {
    super(props);
    // campos do formulario via React Ref
    this.descriptionRef = React.createRef();
    this.completedRef = React.createRef();
    this.state = {
      visible: false,
      visibleError: false
    };
  }

  todoHandler = event => {
    event.preventDefault();
    const description = this.descriptionRef.current.value;
    const completed = this.completedRef.current.value;

    if (description.trim().length === 0) {
      this.setState({ visibleError: true });
      return;
    }

    const payload = {
      query: `
        mutation {
          createTodo(todoInput : { description :"${description}", completed: ${completed}}) {
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
      .then(() => {
        this.setState({ visible: true, visibleError: false });
        this.descriptionRef.current.value = "";
      });
  };

  backHandler = () => {
    window.location = "/";
  };

  render() {
    return (
      <Form onSubmit={this.todoHandler}>
        <Alert color="success" isOpen={this.state.visible}>
          Atividade gravada com sucesso!
        </Alert>
        <Alert color="danger" isOpen={this.state.visibleError}>
          Preencha o campo descrição!
        </Alert>
        <FormGroup>
          <Label for="description">Descrição:</Label>
          <Input
            type="textarea"
            name="description"
            id="description"
            innerRef={this.descriptionRef}
          />
        </FormGroup>
        <FormGroup>
          <Label for="completed">Finalizado</Label>
          <Input
            type="select"
            name="completed"
            id="completed"
            innerRef={this.completedRef}
          >
            <option value="false">Não</option>
            <option value="true">Sim</option>
          </Input>
        </FormGroup>
        <Button type="submit" className="mt-3" color="primary">
          Salvar
        </Button>
        <Button className="ml-2 mt-3" onClick={this.backHandler}>
          Voltar
        </Button>
      </Form>
    );
  }
}

export default NewTodo;

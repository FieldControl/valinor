import React, { Component } from "react";
import { Button, Form, FormGroup, Label, Input } from "reactstrap";
import service from "../services/api";

class NewTodo extends Component {
  constructor(props) {
    super(props);
    // campos do formulario via React Ref
    this.descriptionRef = React.createRef();
    this.completedRef = React.createRef();
  }

  todoHandler = event => {
    event.preventDefault();
    const description = this.descriptionRef.current.value;
    const completed = this.completedRef.current.value;

    if (description.trim().length === 0) {
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
    service().post("/graphql", payload);
  };

  render() {
    return (
      <Form onSubmit={this.todoHandler}>
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
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </Input>
        </FormGroup>
        <Button type="submit" className="mt-3" color="primary">
          Salvar
        </Button>
      </Form>
    );
  }
}

export default NewTodo;

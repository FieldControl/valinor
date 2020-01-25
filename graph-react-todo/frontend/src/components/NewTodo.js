import React, { Component } from "react";
import { Button, Form, FormGroup, Label, Input } from "reactstrap";

class NewTodo extends Component {
  render() {
    return (
      <Form>
        <FormGroup>
          <Label for="description">Descrição:</Label>
          <Input type="textarea" name="description" id="description" />
        </FormGroup>
        <FormGroup check>
          <Label check>
            <Input type="checkbox" /> Finalizado?
          </Label>
        </FormGroup>
        <Button className="mt-3" color="primary">
          Salvar
        </Button>
      </Form>
    );
  }
}

export default NewTodo;

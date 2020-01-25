import React from "react";
import { ListGroup, ListGroupItem } from "reactstrap";

const TodoList = props => {
  return (
    <ListGroup>
      <ListGroupItem>item 1</ListGroupItem>
      <ListGroupItem>item 2</ListGroupItem>
      <ListGroupItem>item 3</ListGroupItem>
    </ListGroup>
  );
};

export default TodoList;

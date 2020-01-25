import React from "react";
import { ListGroup, ListGroupItem } from "reactstrap";

function TodoList(props) {
  const list = props.todos.map(todo => (
    <ListGroupItem tag="a" href="#" key={todo._id}>
      {todo.description}
    </ListGroupItem>
  ));
  return <ListGroup>{list}</ListGroup>;
}

export default TodoList;

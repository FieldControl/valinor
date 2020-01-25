import React from "react";
import {
  ListGroup,
  ListGroupItem,
  ListGroupItemHeading,
  ListGroupItemText
} from "reactstrap";
import { NavLink } from "react-router-dom";

const TodoList = props => {
  const list = props.todos.map(todo => (
    <ListGroupItem key={todo._id}>
      <ListGroupItemHeading>Atividade</ListGroupItemHeading>
      <ListGroupItemText>
        {todo.description}
        <NavLink to={todo._id} className="detail">
          Detalhes
        </NavLink>
      </ListGroupItemText>
    </ListGroupItem>
  ));
  return <ListGroup>{list}</ListGroup>;
};

export default TodoList;

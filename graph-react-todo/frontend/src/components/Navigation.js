import React from "react";
import { Nav, NavItem, NavLink } from "reactstrap";

const Navigation = () => {
  return (
    <Nav>
      <NavItem>
        <NavLink href="/novo" active>
          Adicionar
        </NavLink>
      </NavItem>
    </Nav>
  );
};

export default Navigation;

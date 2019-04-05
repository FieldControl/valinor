import React from "react";
import { Container } from "./styles";

import SearchItem from "../SearchItem";

const SearchList = props => (
  <Container className="list-xitems">
    {props.list.map(item => (
      <SearchItem key={item.id} item={item} />
    ))}
  </Container>
);

export default SearchList;

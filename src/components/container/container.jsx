import React from 'react';
import { Container } from './styles';

const MainContainer = (props) => {
  return <Container>{props.children}</Container>;
};

export default MainContainer;

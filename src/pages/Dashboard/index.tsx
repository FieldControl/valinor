import React from 'react';

import logo from '../../assets/logo.png';

import { Container } from './styles';

const Dashboard: React.FC = () => (
  <Container>
    <header>
      <img src={logo} alt="Walefe" />
      <h1>Github Explorer</h1>
    </header>
    <form>
      <input type="text" placeholder="Digite o nome do repositório" />
      <button type="submit">Pesquisar</button>
    </form>
  </Container>
);

export default Dashboard;

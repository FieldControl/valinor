import React from 'react';
import { FaRegStar, FaRegEye, FaChevronRight } from 'react-icons/fa';

import logo from '../../assets/logo.png';

import { Container, About, RepositoryData } from './styles';

const Repository: React.FC = () => (
  <Container>
    <img src={logo} alt="github" />
    <About>
      <h1>GitHub</h1>
      <p>Description about github an example the software open source</p>
      <RepositoryData>
        <div>
          <FaRegStar size={14} color="#3a3a3a" />
          <p>Stars</p>
        </div>

        <div>
          <FaRegEye size={14} color="#3a3a3a" />
          <p>Watchers</p>
        </div>
      </RepositoryData>
    </About>
    <FaChevronRight size={14} color="#3a3a3a" />
  </Container>
);

export default Repository;

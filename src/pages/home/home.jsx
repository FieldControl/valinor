import React from 'react';
import MainContainer from '../../components/container/container';
import styled from 'styled-components';

const Section = styled.section`
  margin-top: 50px;
`;

const Home = () => {
  return (
    <MainContainer>
      <Section>
        <p>Search for repositories on GitHub.</p>
      </Section>
    </MainContainer>
  );
};

export default Home;

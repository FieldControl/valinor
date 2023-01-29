import styled from 'styled-components';

export const Div = styled.div`
  display: flex;

  img {
    max-height: 28.9rem;
    max-width: 28.9rem;
    border-radius: 1rem;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    margin-right: 5rem;
  }

  p {
    font-family: sans-serif;
    font-weight: 700;
    font-size: 1.5rem;
  }
`;

export const DivFlexList = styled.div`
  display: flex;
  justify-content: space-around;
  margin: 4rem 0;

  div {
    background: #323238;
    color: #fff;
    width: 30%;
    min-height: 40rem;
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  }

  li {
    font-size: 1.5rem;
    font-family: sans-serif;
    font-weight: 700;
    margin-bottom: 1rem;
  }
  h3 {
    font-size: 1.8rem;
    font-family: sans-serif;
    font-weight: 700;
    text-align: center;
    margin-bottom: 1.5rem;
  }
`;

import styled from 'styled-components';

const Container = styled.div`
  max-width: 700px;
  background: #fff;
  border-radius: 4px;
  margin-bottom: 50px;

  input {
    background: #363636;
    height: 28px;
    width: 330px;
    text-indent: 10px;
    border-radius: 4px;
    border: 0;
    color: #fff;

    &:focus {
      background: #f8f8ff;
      color: #000;
    }
  }
`;

export default Container;

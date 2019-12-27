import styled from 'styled-components';

export const Container = styled.div`
  background: #1c1c1c;
`;

export const Content = styled.div`
  height: 60px;
  max-width: 1300px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;

  nav {
    display: flex;
    align-items: center;
    justify-content: center;

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
  }

  aside {
    display: flex;
    align-items: center;
  }

  ul {
    display: flex;
    list-style: none;
  }

  a {
    color: #fff;
    text-decoration: none;
    font-size: 15px;
    padding: 15px;
    &:hover {
      opacity: 0.7;
    }
  }
`;

export const Info = styled.div`
  img {
    height: 20px;
    width: 20px;
    border-radius: 2px;
  }
`;

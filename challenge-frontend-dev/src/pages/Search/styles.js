import styled from 'styled-components';

export const Container = styled.div`
  display: flex;

  max-width: 980px;
  margin: 0 auto;
`;

export const Aside = styled.div`
  margin-top: 20px;
  max-width: 240px;

  ul {
    list-style: none;
    width: 240px;
  }
`;

export const Itens = styled.div`
  border: 1px solid #e6e6e6;
  border-radius: 5px;

  hr {
    width: 238px;
    border: 0.5px solid #e6e6e6;
  }

  ul {
    width: 238px;
    list-style: none;
  }

  li {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    color: #0066cc;
    &:hover {
      background: #f2f2f2;
    }
  }

  a {
    text-decoration: none;
  }

  span {
    padding: 3px 8px;
    color: #fff;
    font-size: 11px;
    font-weight: bold;
    background: #666;
    border-radius: 25px;
  }
`;

export const Languages = styled.div`
  margin-top: 30px;
  border: 1px solid #e6e6e6;
  border-radius: 5px;

  span {
    display: flex;
    justify-content: space-between;
    padding: 4px;
    color: #808080;
    font-size: 13px;
    border-radius: 5px;

    &:hover {
      background: #e6e6e6;
    }
  }

  div {
    padding: 0 30px;
  }

  h4 {
    padding: 15px;
  }

  ul {
    list-style: none;
  }

  li {
    padding: 2px;
  }

  a {
    text-decoration: none;
  }
`;

export const FooterAside = styled.div`
  padding: 20px 0px;
  font-size: 13px;

  ul {
    display: flex;
    list-style: none;
    width: 240px;
  }

  div {
    margin-right: 15px;

    a {
      text-decoration: none;
      color: #0066cc;

      &:hover {
        color: #0066cc;
        text-decoration: underline;
      }
    }
  }

  a {
    text-decoration: none;
    color: #0066cc;
  }
`;

export const Repositories = styled.div`
  margin-top: 20px;
  margin-left: 40px;
  width: 100%;
`;

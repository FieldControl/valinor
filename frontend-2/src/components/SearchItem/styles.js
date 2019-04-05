import styled from "styled-components";

export const Repository = styled.div`
  width: 800px;
  background: #fff;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  margin: 5px;

  header {
    font-size: 20px;
    margin-top: 10px;
    margin-bottom: 30px;
    margin-left: 5px;
    display: flex;
    flex-direction: column;
  }
  small {
    margin-top: 10px;
  }
`;

export const Ul = styled.ul`
  list-style-type: none;
  margin-top: 0;
  padding: 0;
`;

export const Li = styled.li`
  float: left;
  a {
    display: block;
    text-align: center;
    padding: 5px;
    text-decoration: none;
  }
  p {
    padding: 5px;
  }
`;

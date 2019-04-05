import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 30px;
`;

export const Form = styled.form`
  margin-top: 20px;
  width: 100%;
  max-width: 400px;
  display: flex;

  input {
    flex: 1;
    height: 55px;
    padding: 0 20px;
    background: #fff;
    border: 0;
    font-size: 18px;
    color: #444;
    border-radius: 5px;
  }

  button {
    height: 55px;
    padding: 0 20px;
    margin-left: 10px;
    background: #63f5b6;
    color: #fff;
    border: 0;
    font-size: 20px;
    font-weight: bold;
    border-radius: 5px;

    &:hover {
      background: #52d89f;
    }
  }
`;

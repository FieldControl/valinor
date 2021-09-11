import styled from 'styled-components';

export const HeaderContainer = styled.header`
  display: flex;
  width: 100%;
  height: 10vh;
  align-items: center;
  justify-content: space-evenly;
`;

export const Logo = styled.h1``;

export const InputContainer = styled.div``;

export const Input = styled.input`
  padding: 8px 6px;
  width: 250px;
  border-radius: 6px;
  border: solid 1px #d9d0d0;
  background: #f0e9e9;
`;

export const SearchButton = styled.button`
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  background: #1f6feb;
  border: solid 1px #1f6feb;
  color: #f0f6fc;
  margin-left: 5px;
`;

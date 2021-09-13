import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const HeaderContainer = styled.header`
  display: flex;
  width: 100%;
  height: 60px;
  align-items: center;
  background: #161b22;
  padding-left: 5%;
  padding-right: 5%;
`;

export const Logo = styled(Link)`
  .github-icon {
    font-size: 37px;
    margin-right: 15px;
    margin-top: 2px;
    color: #f0f2f5;
  }
`;

export const InputContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
`;

export const Input = styled.input`
  padding: 8px 6px;
  width: 100%;
  border-radius: 6px;
  border: solid 1px #21262d;
  background: #0d1117;
  color: unset;
`;

export const SearchButton = styled(Link)`
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  background: #1f6feb;
  border: none;
  color: #f0f6fc;
  margin-left: 5px;
  font-size: 14px;
`;

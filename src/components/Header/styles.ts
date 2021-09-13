import styled from "styled-components";
import { FaGithub } from "react-icons/fa";

export const Container = styled.div`
  display: flex;
  align-items: center;
  background-color: #161b22;
  padding: 11px 16px;
`;

export const GithubLogo = styled(FaGithub)`
  fill: #fff;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;

export const SearchForm = styled.form`
  width: 100%;
  padding-left: 16px;
  background-color: #161b22;
`;

export const Input = styled.input`
  background: #151515;
  outline: 0;
  border-radius: 6px;
  padding: 7px 12px;
  width: 100%;
  max-width: 210px;
  border: 1px solid #57606a;
  color: #fff;

  &:focus {
    background-color: #fff;
    color: #000;
  }
`;

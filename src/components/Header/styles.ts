import styled from "styled-components";
import { FaGithub } from "react-icons/fa";

export const Container = styled.div`
  display: flex;
  align-items: center;
  background-color: #24292f;
  padding: 11px 16px;
`;

export const GithubLogo = styled(FaGithub)`
  color: #fff;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  cursor: pointer;
`;

export const Input = styled.input`
  background-color: #24292f;
  outline: 0;
  border-radius: 6px;
  padding: 7px 12px;
  width: 100%;
  width: 210px;
  border: 1px solid #57606a;
  color: #fff;
  margin-left: 16px;

  &:focus {
    background-color: #fff;
    color: #000;
    width: 318px;
  }
  transition: width 0.2s ease-out, color 0.2s ease-out;
`;

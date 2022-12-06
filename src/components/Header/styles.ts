import styled from 'styled-components';
import { FaGithub, FaMoon, FaSun, FaSearch } from 'react-icons/fa';

export const Container = styled.div`
  display: flex;
  align-items: center;
  background: var(--header);
  padding: 11px 16px;
  width: 100%;
  > a {
    width: 32px;
    height: 32px;
  }
  .theme {
    width: 20px;
    height: 20px;
  }
`;

export const GithubLogo = styled(FaGithub)`
  fill: var(--logo);
  width: 32px;
  height: 32px;
  flex-shrink: 0;

  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
`;

export const MoonIcon = styled(FaMoon)`
  fill: var(--logo);
  width: 20px;
  height: 20px;
  flex-shrink: 0;

  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
`;

export const SearchIcon = styled(FaSearch)`
  fill: var(--logo);
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  margin-top: 4px;
  margin-left: -32px;

  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
`;

export const SunIcon = styled(FaSun)`
  fill: var(--logo);
  width: 20px;
  height: 20px;
  flex-shrink: 0;

  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
`;

export const SearchForm = styled.form`
  padding-left: 16px;
  width: 100%;
  display: flex;
  align-items: center;

  input {
    background: var(--search);
    color: #fff;
    outline: 0;
    border-radius: 6px;
    padding: 7px 12px;
    width: 200px;

    transition: width 0.2s ease-out, color 0.2s ease-out;
  }

  @media (min-width: 425px) {
    input {
      width: 318px;
    }
  }

  @media (min-width: 768px) {
    &:focus {
      width: 50%;
      transition: width 0.2s ease-out, color 0.2s ease-out;
    }
  }
`;

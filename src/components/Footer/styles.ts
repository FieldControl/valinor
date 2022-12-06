import styled from 'styled-components';
import { FaGithub } from 'react-icons/fa';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 40px;
  position: relative;
`;

export const Line = styled.div`
  max-width: 1280px;
  width: 100%;
  border-top: 1px solid var(--border);
  position: absolute;
  top: 0;
`;

export const GithubLogo = styled(FaGithub)`
  fill: var(--border);
  width: 15px;
  height: 15px;
  flex-shrink: 0;
`;

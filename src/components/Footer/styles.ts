import styled from "styled-components";

import { FaGithub } from "react-icons/fa";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 25px 0;
  width: 100%;
`;
export const Line = styled.div`
  max-width: 1280px;
  width: 100%;
  border-top: 1px solid #d0d7de;
`;
export const GithubLogo = styled(FaGithub)`
  margin-top: 25px;
  fill: #8f969e;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
`;

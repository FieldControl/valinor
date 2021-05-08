import styled from "styled-components";
import { RiGitRepositoryLine } from "react-icons/ri";

export const Container = styled.ul`
  list-style-type: none;
  width: 100%;
  position: relative;

  a {
    text-decoration: none;
  }
`

export const Board = styled.li`
  width: 100%;
  padding-block: 1.5rem;

  border-top: 1px solid var(--btn-border);

  padding-inline: 2rem;

  b {
    font-weight: 700;
  }
`

export const RepoIcon = styled(RiGitRepositoryLine)`
  position: absolute;
  margin: 0.75rem 0 0 -1.5rem;
  fill: var(--gray);
`

export const RepoName = styled.p`
  text-decoration: none;
  color: var(--link);
  font-size: 1rem;
  line-height: 2rem;
` 

export const Description = styled.p`
  font-size: 0.875rem;
  margin-bottom: 0.6rem;
  color: black;
`

export const Meta = styled.footer`
  width: 100%;

  display: flex;
  gap: 1rem;

  margin-top: 0.6rem;

  p {
    font-size: 0.75rem;
    color: var(--p);
  }
`
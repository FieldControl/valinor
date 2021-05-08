import styled from "styled-components";

import {Link} from 'react-router-dom'

export const Container = styled.ul`
  width: 100%;
  list-style: none;
  display: flex;
  gap: 0.3rem;
`

export const Achor = styled(Link)`
  font-size: 0.75rem;
  text-decoration: none;
  font-weight: 600;
  
  padding-block: 0.2rem;
  padding-inline: 0.8rem;

  border-radius: 1rem;
  border: 1px solid rgba(0,0,255,0.1);

  width: 100%;
  height: 100%;
  background: var(--bg-achor);
  color: var(--link);

  &:hover {
    background: var(--bg-achor-hover);
  }
`
import styled from 'styled-components'

// import {Link, LinkProps} from 'react-router-dom'

interface ButtonProps  {
  count?: string
}

interface ContainerProps {
  active?: number
}

export const Container = styled.nav<ContainerProps>`
  width: 100%;
  position: relative;

  button:hover::before,
  button:nth-of-type(${props => props.active})::before {
    content: '';
    position: absolute;
    height: 2.6rem;
    width: 2px;
    margin-left: -1rem;
    background: var(--btn-secondary);
  }

`

export const Button = styled.button<ButtonProps>`
  width: 100%;
  height: 2.6rem;

  border: 0;
  border-radius: 0;
  
  display: flex;
  align-items: center;
  padding-inline: 1rem;

  font-size: 0.875rem;
  text-decoration: none;
  text-transform: capitalize;
  line-height: 1.5;
  color: var(--bg-header);
  background-color: transparent;

  border-bottom: 1px solid var(--btn-border);
  border-inline: 1px solid var(--btn-border);

  transition: background 0.5s;

  &&:first-of-type {
    border-radius: 0.3rem 0.3rem 0 0;
    border-top: 1px solid var(--btn-border);
  }

  &&:last-of-type {
    border-radius: 0 0 0.3rem 0.3rem;
  }

  &&:hover {
    background: var(--btn-primary);
  }

  &&::before {
    transition: background 0.5s
  }

  &&::after {
    position: absolute;
    content: '${props => props.count}';
    display: ${props => props.count ? 'flex' : 'none'};

    height: 1.4rem;
    padding-inline: 0.4rem;
    border-radius: 0.7rem;

    right: 1rem;

    color: var(--white);
    line-height: 0;
    background: var(--gray);

    align-items: center;
  }
`

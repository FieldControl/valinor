import styled from "styled-components"

interface ContainerProps {
  active: number
}

export const Container = styled.nav<ContainerProps>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  gap: 0.3rem;

  button:nth-of-type(${props => props.active <= 3 ? props.active : 4 }) {
    background: var(--select-secundary);
    color: var(--white);
  }

`

export const Achor = styled.button`
  text-decoration: none;
  color: black;
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--btn-border);

  border-radius: 0.5rem;

  display: flex;
  justify-content: center;
  align-items: center;

  background: var(--white);
`
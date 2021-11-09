import styled from 'styled-components'

export const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  width: 100%;
  height: 4rem;
  border: 0.09rem solid var(--header-color-primary);
  border-radius: 0.5rem;

  input {
    width: 10rem;
    height: 2.5rem;
    margin-left: 0.8rem;
    border: none;
    border-radius: 0.5rem;
    outline: none;
    background: var(--background);
    transition: width 1s;
    background: #EEE;
    padding: 0.5rem;
  }
  input:focus {
    width: 30rem;
  }

  @media(max-width: 800px) {
    
    input {
      width: 30rem;
    }
  }
`

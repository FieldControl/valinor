import styled, { css } from 'styled-components';

interface ContentProps{
  isFocused: Boolean;
}


export const Form = styled.form<ContentProps>`
  margin: 0 auto 2rem;
  height: 2.2rem;
  background: var(--background);
  display: flex;
  transition: width 0.2s;
  align-items: center;
  input{
    flex: 1;
    height: 2rem;;
    background: none;
    border-radius: 0.25rem;
    border: 0.05rem solid var(--gray-300);

    ::placeholder{
      font-weight: 300;
      padding-left: 1rem;
    }
  }

  button{
    border: none;
    background: var(--gray-500);
    color: var(--gray-200);
    margin-left: 0.5rem;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    border: 0.05rem solid var(--gray-300);
    
    svg{
      width: 1.25rem;
      height: 1.25rem;
      color: var(--text-primary);
    }

    &:hover{
      filter: brightness(1.2);
    }
  }

${props => props.isFocused && css`
    input{
      border: 0.05rem solid var(--blue-300);
    }
   `
  }
  

`;
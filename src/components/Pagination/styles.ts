import styled from 'styled-components';

export const Container = styled.div`
display: flex;
justify-content: center;
padding: 1rem 0;
`;

export const Content = styled.ul`
display: flex;

  li{
    
    & + li  {
      margin-left: 0.8rem;
    }

    button{
      border: 1px solid var(--gray-300);
      background: inherit;
      border-radius: 0.25rem;
      color: var(--text-primary);
      width: 2rem;
      height: 2rem;
      transition: background-color 0.2s;

      &:hover{
        background: var(--blue-500);
      }

      &:focus{
        background: var(--blue-500);
      }

    } 
  
  }

`;
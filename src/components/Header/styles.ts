import styled from 'styled-components';



export const Container = styled.header`
height: 4rem;
padding: 1rem;
background: var(--gray-700);

`;

export const Content = styled.div`
height: 100%;
display: flex;
align-items: center;

> svg {
  width: 2.25rem;
  height: 2.25rem;
  color: var(--text-primary);
}


@media (max-width: 720px){
  justify-content: center;
  form{
    display: none;
  }
}

`;

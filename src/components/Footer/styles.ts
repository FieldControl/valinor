import styled from 'styled-components';

export const Container = styled.div`
height: 3rem;
align-items: center;
justify-content: center;

`

export const Content = styled.div`
flex: 1;
display: flex;
line-height: 4rem;
justify-content: center;
border-top:  1px solid var(--gray-300);
span{
  color: var(--blue-300);
  font-weight: 300;
  margin-right: 1rem;
}

a{
  text-decoration: none;
  color: var(--blue-300);
  transition: filter 0.2s;

  &:hover{
    filter: brightness(0.8);
  }  
}

`
import styled from 'styled-components';

export const Container = styled.div`



`;

export const Content = styled.div`
max-width: 720px;
margin: 1.5rem auto 0;
padding: 0 2rem;

`;

export const TitleBox = styled.div`
 height: 3rem;
 border-bottom: 1px solid var(--gray-300);
 

  h1{

    strong{
    margin-right: 1rem;
    }

    color: var(--text-primary);
    font-size: 1.5rem;
    line-height: 1.5rem;    
  }


`;

export const CardRepository = styled.ul`
border-bottom: 1px solid var(--gray-300);
padding: 1.8rem 0;
display: flex; 
  
  li {
  display: flex;
  flex-direction: column; 

   a{
    color: var(--blue-300);
    font-size: 1rem;
    line-height: 1.5rem;
    text-decoration: none;
    transition: filter 0.2s;

    &:hover{
      filter: brightness(0.8);
    }
    }

    strong{
    color: var(--text-primary);
    font-weight: 300;
    font-size: 0.9rem;
    line-height: 1.5rem;
    } 
 }
  

`;

export const Icon = styled.i`
  margin-right: 0.5rem;
  padding: 0.25rem;
  min-width: 1rem;
svg {
    color: var(--gray-250);     
 }  

`;

export const CardFooter = styled.div`
display: flex;
flex-wrap: wrap;
 span{
   color: var(--text-secondary);
   font-size: 0.9rem;
   font-weight: 300;
   display: flex;
   align-items: center;

   & + span{
     margin-left: 0.8rem;

   }
 }

`;
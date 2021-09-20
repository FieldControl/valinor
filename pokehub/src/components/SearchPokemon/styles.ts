import styled from 'styled-components';

export const Container = styled.form`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-around;
    height: 100%;
    font-size: 1.5rem;

   strong, input{
       display: block;
       padding: 1rem;
   }

   input {
      border: none;
      width: 50%;
   }

   button {
        padding: 1rem;
        background-color: #FFF;
        border: none;

        &:hover {
            box-shadow: 1px 1px #000;
        }
        
        img{
            width: 2rem;
        }
   }

   p{
       color: var(--red);
       padding: 1rem;
       font-size: 1.2rem;
       display: block;
   }
`;

export const Content = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
`

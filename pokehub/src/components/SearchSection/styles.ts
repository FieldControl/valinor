import styled from 'styled-components';

export const Container = styled.section`
    background-color: var(--searchSection-background);
    display: flex;
    position: sticky;
    top: 0;
    left: 0;
    flex-direction: column;
    justify-content: space-between;

   
    width: 40%;
    height: 100vh;
    max-height: 100vh;

    max-width: 600px;
    min-width: 330px;

    box-shadow: 0 0 0.1rem 0;

    @media(max-width: 1100px){
        width: 100%;
        position: relative;
        max-width: 1100px;
    }
`
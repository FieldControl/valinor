import styled from 'styled-components';

export const Container = styled.footer`
    width: 100%;
    background-color: var(--green);

    display: flex;

    justify-content: center;
    align-items: center;
`

export const Content = styled.div`
    font-size: 1.2em;
    color: #FFF;
    text-shadow: 1rem; 

    padding: 1rem;

    strong {
        text-shadow: 1px 1px #000;
    }
`;
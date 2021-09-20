import styled from 'styled-components';

export const Container = styled.header`
    background-color: var(--red);
`;

export const Content = styled.div`
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
        width: 15rem;
    }
`;

export const Circle = styled.div`
    width: 4rem;
    min-width: 4rem;
    
    height: 4rem;
    min-height: 4rem;

    margin-right: 1rem;

    background-color: var(--blue);

    border: solid 0.3rem #FFF;
    border-radius: 50%;
`;


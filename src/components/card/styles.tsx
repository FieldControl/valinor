import styled from "styled-components";

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    width: 60%;
    height: auto;
    padding: 16px;
    border-bottom: 1px solid #EAEFED;
    gap: .5rem;
`;

export const Topics = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: .5rem;

    button {
        display: flex;
        text-align: center;
        border: 1px solid transparent;
        background: #1f6feb;
        border-radius: 2em;
        color: #ffffff;
        padding: .2rem;
        cursor: pointer;
    };
`;

export const Info = styled.div`
    display: flex;
    gap: .5rem;
`;
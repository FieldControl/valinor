import styled from "styled-components";

export const Container = styled.header`
    display: flex;
    justify-content: space-between;
    width: 100%;   
    height: 61px;
    border-bottom: solid 1px #EAEFED;
`;

export const Logo = styled.div`
    display: flex;
    justify-items: center;
    align-items: center;
    height: 61px;
    width: 20vw;
    margin-left: 32px;
    flex-grow: 1;

    img {
        width: 100%;
        height: 70%;
    };
`;

export const Form = styled.form`
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 60vw;
    flex-grow: 2;
`;

export const User = styled.div`
    display: flex;
    justify-items: center;
    align-items: center;
    height: 61px;
    width: 20vw;
    flex-grow: 1;

    p {
        font-size: 14px;
        font-weight: bold;
    };
`;

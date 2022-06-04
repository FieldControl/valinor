import styled from "styled-components";

export const Input = styled.input`
    border-radius: 50px;
    border: none;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
    cursor: text;
    font-size: 30px;
    font-weight: 700;
    padding: 15px 60px;
    background-color: ${({bg}) => bg || '#fff'};
    color: black;
    margin-bottom: 20px;
    margin-top: 20px;
    &:hover {
        transform: scale(0.99);
        cursor: text;
    }
`
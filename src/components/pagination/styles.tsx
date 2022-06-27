import styled from "styled-components";

export const Ul = styled.ul`
    display: flex;
    justify-content: center;
    align-items: center;
    list-style: none;
    height: 50px;
    width: 60%;
    gap: .1rem;

    button {
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid transparent;
        background: none;
        font-size: 18px;
        padding: .2rem;
        width: 40px;
        cursor: pointer;

        &:hover {
            color: #303030;
            border: 1px solid #bebebe;
            border-radius: 4px;
        };

        &:focus {
            background: #1f6feb;
            color: #ffffff;
            border: none;
            border-radius: 4px;
        };
    };    
`;
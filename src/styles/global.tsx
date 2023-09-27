"use client";
import { createGlobalStyle } from "styled-components";

const Globals = createGlobalStyle`
    * {
        padding: 0;
        margin: 0;
        box-sizing: border-box;
    }
    
    body {
        background: ${(props) => props.theme.colors.bg100};
        font-size: 14px;
        color: ${(props) => props.theme.colors.text100};
        background: -webkit-linear-gradient(to left, #8f94fb, #4e54c8);
        width: 100%;
        height: 100vh;
    }

    .react-modal-overlay{
        background: rgba(0, 0, 0, 0.5);

        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;

        display: flex;
        align-items: center;
        justify-content: center;
    }
    .react-modal-content{
        width: 100%;
        max-width: 576px;
        background: #fff;
        position: relative;
        border-radius: 5px;

        @media (max-width: 768px) {
            width: 25rem;
            padding: .5rem 1rem;
        }

        @media (max-width: 1024px) {
            width: 25rem;
            padding: .5rem 1rem;
        }
    }

    .react-modal-close{
        position: absolute;
        right: 1.5rem;
        top: 1.5rem;
        border: 0;
        background: transparent;

        &:hover{
            filter: brightness(0.9);
        }
    }
`;

export const GlobalStyles = () => {
  return <Globals />;
};

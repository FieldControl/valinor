import { createGlobalStyle } from 'styled-components';

export default createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    scroll-behavior: smooth;
  }

  html, body, #root {
    max-height: 100vh;
    max-width: 100vw;
    width: 100%;
    height: 100%;
    scroll-behavior: smooth;
  }

  html {
    min-height: 100%;
    background: var(--primary);
    scroll-behavior: smooth;
  }

  *, button, input {
    border: 0;
    background: none;
    outline: none !important;
    font-family: var(--font-family);
    color: var(--black);

    transition: color .2s ease-out;
  }
  ul {
    list-style: none;
  }

  :root {
    ${props => {
      const { theme } = props;

      let append = '';
      Object.entries(theme).forEach(([prop, value]) => {
        append += `--${prop}: ${value};`;
      });

      return append;
    }}
  }

  .container{
    overflow: hidden;
    height: 100%;
  }

  .main-content {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }

  a {
    transition: filter 0.6s ease !important;
  }

  a:hover{
    color: rgb(79, 140, 201) !important;
    transition: filter 0.6s ease !important;
    filter: brightness(1.2);
  }

  ::-webkit-scrollbar {
    width: 5px;
  }

  ::-webkit-scrollbar-track {
    background-color: #3333;
  }

  ::-webkit-scrollbar-thumb {
    background: #89777a;
    border-radius: 4px;
    transition: 0.6s ease-in-out !important;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #333333;
    transition: 0.6s ease-in-out !important;
  }

  @media (max-width: 768px) {
    .main-content {
      height: calc(100% - 54px);
    }
  }
`;

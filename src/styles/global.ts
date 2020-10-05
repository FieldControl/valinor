import { createGlobalStyle } from 'styled-components';

export default createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    outline: 0;
    box-sizing: border-box;
  }

  body {
    background-color: #f0f0f5;
    -webkit-font-smoothing: antialiased;
  }

  body, input, button {
    font-family: Roboto, sans-serif;
    font-size: clamp(16px, 5vw, 34px);
  }

  #root {
    max-width: 100vw;
    max-height: 100vh;
    padding: 40px 20px;
  }

  button, a {
    cursor: pointer;
  }
`;

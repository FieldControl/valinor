import {createGlobalStyle} from 'styled-components'

export default createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    outline: 0;
    box-sizing: border-box;
  }

  :root {
    font-size: 16px;

    --bg-body: #ffffff;
    --bg-header: #24292e;
    --bg-achor: #f1f8ff;
    --bg-achor-hover: #ddeeff;

    --gray: #6a737d;

    --btn-primary: #f6f8fa;
    --btn-secondary: #f9826c;
    --btn-border: #e1e4e8;

    --select-bg: #fafbfc;
    --select-secundary: #0366d6;

    --white: #fff;
    --black: #000;

    --link: #0366d6; 

    --p: #586069
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  }
`
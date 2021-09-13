import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
 * {
   margin: 0;
   padding: 0;
   box-sizing: border-box;
  }
 *:focus {
   outline: none;
  }
  body{
    font-family: 'Open Sans', sans-serif;
    background-color: #0d1117;
    overflow-x: hidden;
    color: #c9d1d9;
  }
  ul{
    list-style: none;
  }
  a{
    text-decoration: none; 
  }
`;

export default GlobalStyle;

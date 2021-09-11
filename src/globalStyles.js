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
  }
  ul{
    list-style: none;
  }
`;

export default GlobalStyle;

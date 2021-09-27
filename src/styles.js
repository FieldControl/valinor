import { createGlobalStyle } from "styled-components"

export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Roboto:400,500,600');  
  html, body {
    font-family: Roboto, sans-serif;
    font-size: 17px;
    line-height: 1.5;
  }
  * {
    box-sizing: border-box;
  }
`

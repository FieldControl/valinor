import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`

    @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600&display=swap');
    * {
        box-sizing: border-box;
        margin:0;
    }
    body {
        background-image: linear-gradient(to right,#DCDCDC ,#505050);;
        color: hsl(124, 100% 9%);
        font-family: Times-new-roman;
        font-size: 1.15em;
        margin: 0;
    }
    h1{
        text-align:'center';
        margin:0;
        color:#FDFDFD;
        padding:8px;
    }
    h2{
        padding:16px;
    }
    img {
        max-width: 100%;
    }
`

export default GlobalStyles
import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

    * {
        box-sizing: border-box;
    }

    body {
        background: ${({ theme }) => theme.colors.body};
        color: hsl(192, 100% 9%);
        font-family: 'Poppins', sans-serif;
        font-size: 1.15em;
        margin: 0;
    }
    h1{
        color: ${({color}) => color || '#fff'};
        margin-bottom: 50px;
    }
    h2{
        color: ${({color}) => color || '#fff'};
    }
    h4{
        color: ${({color}) => color || '#FFFF00'};
        font-size: 1.30em;
    }


    p {
        opacity: 0.6;
        line-height: 1.5;
        color: ${({color}) => color || '#fff'};
    }

    img {
        max-width: 100%;
    }
`

export default GlobalStyles
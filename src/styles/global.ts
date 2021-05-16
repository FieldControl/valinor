import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`

:root{
  --background: #0d1117;
  --background-mobile: #010409;
  --text-primary:#f0f6fc;
  --text-secondary: #8b9496;
  --gray-700: #161b22; 
  --gray-500: #21262d;
  --gray-300: #30363d;
  --gray-250: #6a737d;
  --gray-200: #c9d1d9;
  --blue-300: #58a6ff;
  --blue-500: #1f6feb;
   
} 

*{
  margin: 0;
  padding: 0;
  outline: 0;
  box-sizing: border-box;
}

html{
  @media (max-width: 1080px){
    font-size: 93.75%;
  }

  @media (max-width: 720px){
    font-size: 87.05%;
  }
}

body{
  -webkit-font-smoothing: antialiased;
  background: var(--background);


  @media (max-width: 720px){
   background: var(--background-mobile);
  }

}

body, textarea, input, button{
  font-family: 'Roboto', sans-serif;
  color: var()
}


h1, h2, h3, h4,h5, h6,strong{
  font-weight: 700;
}

ul{
  list-style: none;
}


button{
  cursor: pointer;
}



`;
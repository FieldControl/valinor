import styled from "styled-components";

export const fontColor = "#BDD1D9"
export const bgContainers = "#30363D"
export const bgMainDiv = "#0D1117"

export const Button = styled.button`
border: 1px solid rgb(255,255,255, 0.5);
background-color: transparent;
border-radius: 5px;
transition: 500ms;
color: ${fontColor};

&:hover{
    transition: 500ms;
    background-color: lightgray;
}
`

export const MainDIv = styled.div`
display: flex;
align-items: center;
flex-direction: column;
width: 100%;
min-height: 100vh;
color: ${fontColor};
background-color: ${bgMainDiv};
padding: 30px 0;
`

export const H1 = styled.h1`
text-align: center;
`

export const Input = styled.input`
background-color: #0D1117;
border-radius: 5px;
padding: 5px 10px;
border: 1px solid rgb(255,255,255, 0.5);
margin-right: 5px;
color: ${fontColor};
transition: 500ms;

&:focus{
    transform: scale(1.05 , 1);
    margin-right: 10px;
    transition: 500ms;

}
`

export const Select = styled.select`
background-color: ${bgContainers};
color: ${fontColor};
`


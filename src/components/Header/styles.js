import styled from "styled-components";

export const HeaderContainer = styled.div`
    width:100%;
    background-color: #24292F;
    padding:16px 0px;
`

export const SearchInput = styled.input`
    width:50%;
    opacity:0.7;
    height:1rem;
    background-color: #fcf7f0;
    border-radius:24px;
    padding:24px;   
    border:0.8px solid gray;
    font-size:14px;

    :hover{
        background-color: #DCDCDC;
    }
`

export const TitleMessage = styled.h1`
    text-align:center;
    color:#FFF;
    justify-content:center;
    margin:16px 0px;
`

export const SearchButton = styled.button`
    
    border-radius: 50px; 
    border: none; 
    box-shadow: 0 0 10px 
    rgba(0, 0, 0, 0.15); 
    cursor: pointer; 
    font-size: 16px; 
    font-weight: 700; 
    padding: 15px 60px; 
    background-color: #F3CA20; 
    color: #333;

    :hover {
        transform: scale(0.98);
    }
`
export const SearchContainer = styled.div`
    display:flex;
    align-content:space-between;
    align-items:center;
    justify-content:space-around;
`

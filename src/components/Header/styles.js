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
    padding:16px;   
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
    padding:8px;   
    border-radius:16px;
    background-color: #dbd6d0;
    cursor:pointer;
    border:0.8px solid gray;

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

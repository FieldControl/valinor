import React from 'react'
import styled from 'styled-components';
import logo from '../img/marvel-logo.png'



const Logo = styled.header`
  height: 100px;
  img{
    width: 200px;
    margin-left:650px;
    margin-top: 10px
  }
  
`;

const Header = () => {
    return (
        <Logo>
        <header id="center">

        <img src={logo} alt="logoMarvel"/>
        
        </header>
        </Logo>
    )
}

export default Header

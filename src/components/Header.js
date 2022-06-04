import { StyledHeader, Nav, Logo, Image } from "./styles/Header.styled"
import { Container } from "./styles/Container.styled"
import React, { useState } from 'react';
import { Flex } from "./styles/Flex.styled"
import { Button } from "./styles/Button.styled"
import { Input } from "./styles/input.styled"

import { useInput } from "./Context";




export default function Header () {
    const { setInput } = useInput()

    const [text, setText] = useState('node')
  
    const textHandler = (text) => {
        console.log(text)
        const restext = text.split(' ').join('%20').toLowerCase();
        console.log(restext)
        setText(restext);

    }

    return(
        <StyledHeader >
            
            <Container>
            <Nav> 
                <Logo src='./images/logo.png' alt='' />
                <Button>Se Cadastre</Button>
            </Nav>
            <Flex>
                <div >
                    <h1 color='#fff'>
                        Busque um Repositório!
                    </h1>
                    <Button bg='#b727f9' color='#fff' onClick={() => setInput(text)}>
                        Buscar Repositório
                    </Button>

                    <Input type="text" bg='$f00fff' onChange={(e) => textHandler(e.target.value)} color='#fff' placeholder="node..."></Input>
                </div>

                <Image src='./images/illustration-mockups.svg' alt=''>

                </Image>
            </Flex>
            </Container>
        </StyledHeader>
    )
}
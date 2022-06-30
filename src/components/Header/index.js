import React, { useContext } from 'react';
import { 
    HeaderContainer, 
    SearchInput, 
    SearchButton,
    TitleMessage,
    SearchContainer, 
} from "./styles"

import GlobalContext from "../../contexts/globalContext";

export default function Header () {
    const { text, textModifier, makeRequest } = useContext(GlobalContext)

    return(
        <HeaderContainer>
            <TitleMessage>Busque um repositório do GitHub 🧐​</TitleMessage>
            <SearchContainer>
                <SearchInput placeholder="Digite aqui o Repositório que busca" defaultValue={'Node'} onChange={(event) => textModifier(event.target.value)}/>
                <SearchButton disabled={text == ''} onClick={() => makeRequest()}>Buscar </SearchButton>
            </SearchContainer>
        </HeaderContainer>

    )
}
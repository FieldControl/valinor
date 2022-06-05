//Componente para exibir decrição caso exista

import React from "react";
import styled from "styled-components";

const Div= styled.div`
border: 1px solid rgb(119,136,153, 0.5);
border-radius: 5px;
box-shadow: 0 0 15px rgb(119,136,153, 0.5);
padding: 15px;
margin: 30px 0;
display: flex;
flex-direction: column;
flex-wrap: wrap;

width: 450px;

@media screen and (max-width: 450px){
  width: 350px;
  padding: 5px 0;
  text-align: center;
}
`

const P = styled.p`
font-weight: 500;
`

const SearchRepoResultsDescription = (props)=>{



    return<Div>
    
        {props.description && <h2>{props.description.name}</h2>}
        {props.description && <P>{props.description.short_description}</P>}
    </Div>
}

export default SearchRepoResultsDescription
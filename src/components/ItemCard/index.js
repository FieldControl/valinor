import React from "react";

import { 
    ContainerRepository,
    StarsInRepository,
    LinkRepository
} from './styles'

export default function ItemCard ({ item }) {
  
  return (
      <>

        <LinkRepository target="_blank" href={ item.html_url } > 
          <ContainerRepository >  
                <StarsInRepository  > { item.stargazers_count } ⭐ No repositório</StarsInRepository> 
                <h1 style={{color:'white'}}>{ item.name }</h1>
                <h2 style={{color:'#dadada'}}>{ item.description }</h2>
                <img src={ item.owner.avatar_url } style={{width:90, height:90, borderRadius: 90, padding: 4, float:'right'}}/>
                {item.language ? <p style={{padding:32}}>Principal linguagem do projeto é { item.language }</p> :<p style={{padding:32}}>O projeto não tem uma linguagem principal apontada</p>}
          </ContainerRepository>
        </LinkRepository>

      </>
  );
}
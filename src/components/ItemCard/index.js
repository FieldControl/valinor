import React from "react";

import { 
    ContainerRepository,
    StarsInRepository,
} from './styles'

export default function ItemCard ({ item }) {
  
  return (
      <>

        <ContainerRepository >
            <StarsInRepository  > { item.stargazers_count } ⭐ In repository</StarsInRepository> 
            <h1 style={{color:'black'}}>{ item.name }</h1>
            <h2 style={{color:'#412342'}}>{ item.description }</h2>
            <img src={ item.owner.avatar_url } style={{width:90, height:90, borderRadius: 90, padding: 4, float:'right'}}/>
            <a target="_blank" href={ item.html_url } style={{padding:24}}> Se quiser conhecer mais sobre o repositório { item.name } clique aqui</a>
            <p style={{padding:32}}>Principal linguagem do projeto é { item.language }</p>
        </ContainerRepository>

      </>
  );
}
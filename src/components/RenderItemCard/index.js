import React, { useContext } from "react";
import GlobalContext from "../../contexts/globalContext";

import {
  Container,
  RenderItemTitle,
  EmptySpace,
} from './styles'

import ItemCard from "../ItemCard";

export default function RenderItemCard () {
  const { response, loading } = useContext(GlobalContext)

  return (
    <Container>
        {
          loading ? 
              <RenderItemTitle >Carregando... Aguarde um momento</RenderItemTitle>
          :
            <>
              {
                response?.total_count > 0 ?
                 <RenderItemTitle>Foram encontrados { response.total_count } repositórios com esse filtro</RenderItemTitle> 
                :
                 <RenderItemTitle>​Sem repositórios com esse filtro, que tal buscar outros?​</RenderItemTitle> 
              }
              {
                response.items?.map((item) => (
                  <ItemCard item={item} />
                  ))
                }
                <EmptySpace />
            </>
        }
    </Container>
  );
}
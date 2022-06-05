import React from "react";
import styled from "styled-components"

import { Button } from "../../styles/styles";


const SelectedButton = styled(Button)`
background-color: lightblue;
margin: 0 2px;
`

const UnSelectedButton = styled(Button)`
margin: 0 2px;
`

const Div = styled.div`
margin-top: 20px;
`

const PontosSpan = styled.span`
margin: 0 8px;
`

const PaginationComponent = (props)=>{
    const paginas = props.paginas
    
    const usePagination = (vizinhos)=>{
        const arrayDePaginas = []
        let i=1
        if(paginas<=9){
           for(i;i<=paginas;i++){
               arrayDePaginas.push(i)
           } 
        }else{
            const mostraPontosEsquerdo = vizinhos + 2 < props.paginaAtual - 2
            const mostraPontosDireito = vizinhos + 2 < (paginas - 1) - props.paginaAtual
            


            const arrayVizinhosEsquerdo = Array.from(Array(vizinhos), (_, index)=> (index + 1)*-1)
            const arrayVizinhosDireito = Array.from(Array(vizinhos), (_, index)=> index + 1)
            const arrayPaginasCentro = Array.from([...arrayVizinhosEsquerdo,0,...arrayVizinhosDireito], (vizinho)=> props.paginaAtual + vizinho)
            .sort((a,b)=> a-b).filter(vizinho=> vizinho - 2 > 0 && vizinho + 1 <= paginas - 1)

            if(mostraPontosDireito && !mostraPontosEsquerdo){
                if(props.paginaAtual - vizinhos === 4){

                    arrayDePaginas.push(1, 2,3, ...arrayPaginasCentro, "...",paginas-1, paginas)

                }else{
                    arrayDePaginas.push(1, 2, ...arrayPaginasCentro, "...",paginas-1, paginas)
                }

            }
            else if(mostraPontosDireito && mostraPontosEsquerdo){
                arrayDePaginas.push(1, 2, "...",...arrayPaginasCentro,"...", paginas-1, paginas)
            }else{
                if((props.paginaAtual + vizinhos) === (paginas - 3)){
                    arrayDePaginas.push(1, 2, "...",...arrayPaginasCentro,paginas-2, paginas-1, paginas)
                }else{
                    arrayDePaginas.push(1, 2, "...",...arrayPaginasCentro, paginas-1, paginas)
                }

            }
        }
        return arrayDePaginas
    }



    const arrayDePaginasMap = usePagination(2).map((pagina)=>{
        if(pagina !== "..."){
            if(pagina === props.paginaAtual){
                return <SelectedButton key={pagina}>{pagina}</SelectedButton>
            }
            return <UnSelectedButton key={pagina} onClick={()=>props.setPaginaAtual(pagina)}>{pagina}</UnSelectedButton>
    }
        return <PontosSpan key={pagina}>{pagina}</PontosSpan>
    })

    return <Div>
        
        {props.paginaAtual=== 1 || <Button onClick={()=>props.setPaginaAtual(props.paginaAtual - 1)} >anterior</Button>}
        {arrayDePaginasMap}
        {props.paginaAtual=== paginas || <Button onClick={()=>props.setPaginaAtual(props.paginaAtual + 1)} >proximo</Button>}
    </Div>
}

export default PaginationComponent
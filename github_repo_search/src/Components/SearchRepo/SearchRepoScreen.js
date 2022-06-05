//Tela de exibição da página de consulta

import React, {useEffect, useState} from "react";
import {getRepositories, getTopicDescription} from '../../requests/Requests'
import { MainDIv, H1, Input, Button } from "../../styles/styles";
import PaginationComponent from "../Pagination/Pagination";
import PaginationSelector from "../Pagination/PaginationSelector";
import SearchRepoResults from "./SearchRepoResults";
import SearchRepoResultsDescription from "./SearchRepoResultsDescription";
import styled from "styled-components";



const ButtonBuscar = styled(Button)`
background-color: #30363D;
margin-right: 5px;

&:hover{
  background-color: transparent;
}
`

const Div = styled.div`
display: flex;
flex-direction: column;
max-width: 450px;
align-items: center;


div{
  margin-bottom: 15px;
}

@media screen and (max-width: 450px){
  width: 350px;
}
`


const SearchRepoScreen = (props)=>{
  
  //termo de busca
  const [queryString, setQuerystring] = useState('')
  
  //erro de busca
  const [searchRepoResultsError, setSearchRepoResultsError] = useState("")
  
  //possível descrição do termo de busca
  const [searchRepoResultsDescription, setSearchRepoResultsDescription] = useState({})
 
  //última pesquisa feita
  const [ultimaPesquisa, setUltimaPesquisa] = useState("")
  
  //ordenação
  const [sort, setSort] = useState({})
  
  //resultados por página
  const [searchRepoResults, setSearchRepoResults] = useState([])
  
  //pagina atual da pesquisa
  const [paginaAtual, setPaginaAtual] = useState(1)
  
  //total de páginas disponíveis (limite max de repositórios = 1000) 
  const [totalDePaginas, setTotalDePaginas] = useState(0)
  
  //qtd de exibição por página
  const [repoPerPage,setRepoPerPage ] = useState(15)

  
  useEffect(()=>{
    ultimaPesquisa && procuraRepositorios(ultimaPesquisa)
  }, [paginaAtual])

  useEffect(()=>{
    paginaAtual===1 || setPaginaAtual(1)
    paginaAtual===1 && procuraRepositorios(ultimaPesquisa)
  }, [repoPerPage, sort])


  const onChangeInputSearchRepo = (event)=>{
    setQuerystring(event.target.value)
  }


  const lidaComResponseProcuraRepositorios = (response)=>{
    let totalDePaginasAux = 0
    
    if(response.total_count>1000){
      totalDePaginasAux = Math.ceil(1000/repoPerPage) 
    }else{
      totalDePaginasAux = Math.ceil((response.total_count/repoPerPage))
    }

    response.items.length>0? setSearchRepoResults(response.items) : setSearchRepoResults([])

    
    response.items.length>0? setSearchRepoResultsError("") : setSearchRepoResultsError("nenhuma correspondência encontrada")

    setTotalDePaginas(totalDePaginasAux)
  }

  const procuraRepositorios = (string)=>{
    if(queryString || ultimaPesquisa){
      window.scrollTo(0,0)

      getRepositories(string, sort.sort, sort.order, paginaAtual, repoPerPage)
      .then((response)=>{
        lidaComResponseProcuraRepositorios(response)
      })
      .catch((error)=>{
        console.log(error)
        setSearchRepoResultsError('não foi possível fazer a pesquisa, tente novamente em instantes')
      })
    } 
  }

  const procuraDescricaoTopico = ()=>{
    getTopicDescription(queryString)
    .then((response)=>{
        response.items.length>0? setSearchRepoResultsDescription(
            {name: response.items[0].name, 
            short_description: response.items[0].short_description}) : setSearchRepoResultsDescription({})
      })
  }

  const onClickButtonSearchRepo = ()=>{
    
    if(queryString!== ultimaPesquisa){
      
      setPaginaAtual(1)

      queryString && setUltimaPesquisa(queryString)
      
      procuraRepositorios(queryString)    
      
      procuraDescricaoTopico()
    
    }
    
    setQuerystring("")


  }

  const onKeyDownInputSearchRepo = (event)=>{
    const key = event.key
    key==="Enter" && onClickButtonSearchRepo()
  }

  return (
    <MainDIv className="App">


        <H1>Buscar por repositórios no Github</H1>
       
        <Div>
          <div>

            <Input onKeyDown={onKeyDownInputSearchRepo} placeholder='buscar repositorio' 
            value={queryString} 
            onChange={onChangeInputSearchRepo} 
            autoFocus/> 

            <ButtonBuscar onClick={onClickButtonSearchRepo} >buscar</ButtonBuscar>
          </div>

          <PaginationSelector setRepoPerPage={setRepoPerPage} 
          setSort={setSort}/>
        
        </Div>

        {searchRepoResultsDescription.name && searchRepoResultsDescription.short_description && <SearchRepoResultsDescription description={searchRepoResultsDescription}/>}

        <SearchRepoResults results={searchRepoResults} 
        error={searchRepoResultsError} 
        paginaAtual={paginaAtual} 
        />
        {console.log("sort",sort)}

        {searchRepoResults.length>0 && <PaginationComponent  paginaAtual={paginaAtual}
         setPaginaAtual={setPaginaAtual} 
         paginas={totalDePaginas} />}
    </MainDIv>
  );
}

export default SearchRepoScreen
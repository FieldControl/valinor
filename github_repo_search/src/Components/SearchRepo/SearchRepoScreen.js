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


const SearchRepoScreen = (props)=>{
    	
  const [queryString, setQuerystring] = useState('')
  const [searchRepoResultsError, setSearchRepoResultsError] = useState("")
  const [searchRepoResultsDescription, setSearchRepoResultsDescription] = useState({})
  const [ultimaPesquisa, setUltimaPesquisa] = useState("")
  
  const [searchRepoResults, setSearchRepoResults] = useState([])
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [totalDePaginas, setTotalDePaginas] = useState(0)
  const [repoPerPage,setRepoPerPage ] = useState(15)
  
  useEffect(()=>{
    ultimaPesquisa && procuraRepositorios(ultimaPesquisa)
  }, [paginaAtual])

  useEffect(()=>{
    paginaAtual===1 || setPaginaAtual(1)
    paginaAtual===1 && procuraRepositorios(ultimaPesquisa)
  }, [repoPerPage])

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
    (queryString || ultimaPesquisa) && getRepositories(string, "", "", paginaAtual, repoPerPage)
    .then((response)=>{
        lidaComResponseProcuraRepositorios(response)
    })
    .catch((error)=>{
        console.log(error)
      setSearchRepoResultsError('não foi possível fazer a pesquisa, tente novamente em instantes')
    })
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
    
    setPaginaAtual(1)

    queryString && setUltimaPesquisa(queryString)
    
    procuraRepositorios(queryString)    
    
    procuraDescricaoTopico()

    setQuerystring("")

  }

  const onKeyDownInputSearchRepo = (event)=>{
    const key = event.key
    key==="Enter" && onClickButtonSearchRepo()
  }

  return (
    <MainDIv className="App">


        <H1>Buscar por repositórios no Github</H1>
        <div>
        <Input onKeyDown={onKeyDownInputSearchRepo} placeholder='buscar repositorio' 
        value={queryString} 
        onChange={onChangeInputSearchRepo} 
        autoFocus/> 
        <ButtonBuscar onClick={onClickButtonSearchRepo} >buscar</ButtonBuscar>
        <PaginationSelector setRepoPerPage={setRepoPerPage} />
        </div>

        {searchRepoResultsDescription.name && searchRepoResultsDescription.short_description && <SearchRepoResultsDescription description={searchRepoResultsDescription}/>}

        <SearchRepoResults results={searchRepoResults} 
        error={searchRepoResultsError} 
        paginaAtual={paginaAtual} 
        />

        {searchRepoResults.length>0 && <PaginationComponent  paginaAtual={paginaAtual}
         setPaginaAtual={setPaginaAtual} 
         paginas={totalDePaginas} />}
    </MainDIv>
  );
}

export default SearchRepoScreen
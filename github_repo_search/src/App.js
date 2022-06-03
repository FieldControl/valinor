import React, {useState} from 'react'
import {getRepositories, getTopicDescription} from './requests/Requests'

function App() {
  
  const [queryString, setQuerystring] = useState('')
  const [searchRepoResults, setSearchRepoResults] = useState([])
  const [searchRepoResultsError, setSearchRepoResultsError] = useState([])
  const [searchRepoResultsDescription, setSearchRepoResultsDescription] = useState('')
  const [listaDePaginas, setListaDePaginas] = useState([])
  const [paginaAtual, setPaginaAtual] = useState([])

  
  const onChangeInputSearchRepo = (event)=>{
    setQuerystring(event.target.value)
  }
  
  const onClickButtonSearchRepo = ()=>{
    getRepositories(queryString, "", "", 2, 15).then((response)=>{
      setSearchRepoResults(response.items)
    }).catch((error)=>{
      setSearchRepoResultsError('não foi possível fazer a pesquisa, tente novamente em instantes')
    })
    
    getTopicDescription(queryString).then((response)=>{
      setSearchRepoResultsDescription(response.items[0].short_description)
    })
  }


  const searchRepoResultsMap = searchRepoResults.map((repo)=>{
    return <div key={repo.id}>{repo.full_name}</div>
  })

  return (
    <div className="App">

      <h1>repositories</h1>
      <div>
      <input placeholder='buscar repositorio' 
      value={queryString} 
      onChange={onChangeInputSearchRepo} /> 
      <button onClick={onClickButtonSearchRepo} >search</button>
      </div>

      {searchRepoResultsDescription && searchRepoResultsDescription}
      {searchRepoResults && searchRepoResultsMap}
    </div>
  );
}

export default App;

import './styles/App.scss'
import InputSearch from "./components/InputSearch"
import ListRepository from "./components/ListRepository"

import axios from 'axios'
import { useEffect, useState } from 'react'
import Pagination from './components/Pagination'

function App() {

  const [listRepository, setListRepository] = useState()
  const [pageCurrently, setPageCurrently] = useState(1)
  const [amountRepositories, setAmountRepositories] = useState(0)
  const [keyword, setKeyword] = useState('')

  console.log(listRepository)

  useEffect(() => {
    searchRepository(keyword, pageCurrently)
  }, [pageCurrently])


  function updatePage(page){
    setPageCurrently(page)
  }

  function searchRepository(keywordInput, page){
    if(keyword !== keywordInput) {setKeyword(keywordInput)}

    axios
      .get(`https://api.github.com/search/repositories?q=${keywordInput}&per_page=5&page=${page}`)
      .then((response) => {setListRepository(response.data.items) ; setAmountRepositories(response.data.total_count); console.log(response.data)})
      .catch((error) => console.log('Error: ', error));
  }

  return (
    <main>
      <InputSearch searchRepository={searchRepository} />

      {listRepository === undefined && <div className='no-reposotories'>No repositories, perform your search...</div>}

      {listRepository && <div className="container">
        <div className='repos'>
          <ListRepository list={listRepository} updatePage={updatePage} amountRepositories={amountRepositories}/>
          <Pagination quantityRepo={1000} perPage={5} updatePage={updatePage} />
        </div>

      </div>}
    </main>
  )
}

export default App

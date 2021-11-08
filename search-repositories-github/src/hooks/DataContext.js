import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../services/api'

export const DataContext = createContext({})

function DataProvider({ children }) {
  const [data, setData] = useState({ items: [], total_count: 0, totalPages: 0 })
  const [currentRepositoryName, setCurrentRepositoryName] = useState('')
  const [isPossibleCallApi, setIsPossibleCallApi] = useState(true)
  const [issuesData, setIssuesData] = useState({ total_count: 0, items: [] })

  const [currentPageInParams, setCurrentPageInParams ] = useState(1)

  useEffect(() => {
    localStorage.clear()
  }, [])

  function currentPage() {
    return currentPageInParams
  }

  async function handleSetCurrentPage(page = 1) {
    // Enquanto a requisição não terminar, ele não vai deixar fazer outra chamada
    if (isPossibleCallApi) {
      setIsPossibleCallApi(false)
      setCurrentPageInParams(page)

      const response = await api.get(`https://api.github.com/search/repositories?q=${currentRepositoryName}&per_page=7&page=${page}`)
      
      if (response.status === 200) {
        const totalPages = Math.ceil(response.data.total_count / 7)
        setData({ ...response.data, totalPages })
      }

      setIsPossibleCallApi(true)
    }

  }

  async function getDataRepositories(repositoryName, page = 1) {

    if (repositoryName.trim() === "") {
      return;
    }
    
    setCurrentPageInParams(page)

    const response = await api.get(`https://api.github.com/search/repositories?q=${repositoryName}&per_page=7&page=${page}`)
    
    if (response.status === 200) {
      const totalPages = Math.ceil(response.data.total_count / 7)
      setData({ ...response.data, totalPages })
      setCurrentRepositoryName(repositoryName)
      
      return {
        items: response.data,
        total_count: response.data.total_count,
        totalPages
      }
    }

    return;
  }

  async function getIssuesFromRepository(username, repositoryName) {
    if (repositoryName.trim() === "" || username.trim() === "") {
      return;
    }

    const response = await api.get(`/search/issues?q=repo:${username}/${repositoryName}`)
    
    if (response.status === 200) {
      setIssuesData(response.data)
    }
  }
  
  return (
    <DataContext.Provider value={{
      data,
      currentPage,
      handleSetCurrentPage,
      getDataRepositories,
      getIssuesFromRepository,
    }}>
      {children}
    </DataContext.Provider>
  );
}

function useGithubData() {
  const context = useContext(DataContext)
  return context
}

export {
  DataProvider,
  useGithubData
}
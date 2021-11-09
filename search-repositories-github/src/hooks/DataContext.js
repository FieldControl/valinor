import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../services/api'

export const DataContext = createContext({})

function DataProvider({ children }) {
  const [data, setData] = useState({ items: [], total_count: 0, totalPages: 0 })
  const [topics, setTopics] = useState({ total_count: 0 })
  const [commits, setCommits] = useState({ total_count: 0 })
  const [currentRepositoryName, setCurrentRepositoryName] = useState('')
  const [isPossibleCallApi, setIsPossibleCallApi] = useState(true)

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

      const response = await api.get(`/search/repositories?q=${currentRepositoryName}&per_page=7&page=${page}`)
      
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

    const response = await api.get(`/search/repositories?q=${repositoryName}&per_page=7&page=${page}`)
    
    if (response.status === 200) {
      const totalPages = Math.ceil(response.data.total_count / 7)
      setData({ ...response.data, totalPages })
      setCurrentRepositoryName(repositoryName)

      await getTopicsFromRepository(repositoryName)
      await getCommitsFromRepository(repositoryName)
      
      return {
        items: response.data,
        total_count: response.data.total_count,
        totalPages
      }
    }

    return;
  }

  async function getTopicsFromRepository(repositoryName) {
    if (repositoryName.trim() === "") {
      return;
    }

    const response = await api.get(`/search/topics?q=${repositoryName}`)
    
    if (response.status === 200) {
      setTopics({ total_count: response.data.total_count })
      return response.data  
    }
  }
  
  async function getCommitsFromRepository(repositoryName) {
    if (repositoryName.trim() === "") {
      return;
    }

    const response = await api.get(`/search/commits?q=${repositoryName}`)
    console.log(response.data)
    if (response.status === 200) {
      setCommits({ total_count: response.data.total_count })
      return response.data  
    }
  }
  return (
    <DataContext.Provider value={{
      data,
      currentPage,
      handleSetCurrentPage,
      getDataRepositories,
      topics,
      commits
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
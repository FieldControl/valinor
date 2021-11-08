import { createContext, useContext, useState } from 'react'
import { api } from '../services/api'

export const DataContext = createContext({})

function DataProvider({ children }) {
  const [data, setData] = useState({ items: [], total_count: 0, totalPages: 0 })
  const [currentPageInParams, setCurrentPageInParams ] = useState(1)

  function currentPage() {
    return currentPageInParams
  }

  function handleSetCurrentPage(page = 1) {
    setCurrentPageInParams(page)
  }

  async function getDataRepositories(repositoryName, page = 1) {
    if (repositoryName.trim() === "") {
      return;
    }
    
    setCurrentPageInParams(page)
    const response = await api.get(`https://api.github.com/search/repositories?q=${repositoryName}&per_page=15&page=${page}`)

    if (response.status === 200) {
      const totalPages = Math.ceil(response.data.total_count / 15)
      setData({ ...response.data, totalPages })
      
      return {
        items: response.data,
        total_count: response.data.total_count,
        totalPages
      }
    }

    return;
  }
  
  return (
    <DataContext.Provider value={{
      data,
      currentPage,
      handleSetCurrentPage,
      getDataRepositories
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
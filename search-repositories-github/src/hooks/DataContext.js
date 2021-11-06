import { createContext, useContext, useState } from 'react'

export const DataContext = createContext({})

function DataProvider({ children }) {
  const [data, setData] = useState({ items: [], total_count: 0 })

  function setGithubData(githubData) {
    setData(githubData)
  }
  return (
    <DataContext.Provider value={{
      data,
      setGithubData
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
import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../services/api'
import { calculateTotalPages } from '../utils/calculateTotalPages'

export const DataContext = createContext({})

/**
 * Componente DataProvider
 * é responsável por obter/fornecer os dados do repositório pesquisado e
 * realizar as principais chamadas a api.
 * @param children componente filho a ser envolvido pelo contexto que fornece os dados do repositório e callbacks a api do github.
 */
function DataProvider({ children }) {
  const [data, setData] = useState({ items: [], total_count: 0, totalPages: 0 })
  const [topics, setTopics] = useState({ total_count: 0 })
  const [commits, setCommits] = useState({ total_count: 0 })
  const [currentRepositoryName, setCurrentRepositoryName] = useState('')
  const [isPossibleCallApi, setIsPossibleCallApi] = useState(true)

  const [currentPageInParams, setCurrentPageInParams ] = useState(1)

  /**
   * Retorna o número da página atual do repositório
   * @returns página atual da listagem de repositórios
   */
  function currentPage() {
    return currentPageInParams
  }

  /**
   * Recupera todas as linguagens utilizadas por um repositório
   * @param {*} username nome de usuário do criador do repositório
   * @param {*} repositoryName nome do repositório
   * @param {*} setLanguagesState função para setar o estado
   * @returns void
   */
  async function getLanguages(username, repositoryName, setLanguagesState) {
    if (repositoryName.trim() === "" || username.trim() === "") {
      return;
    }
    const response = await api.get(`/repos/${username}/${repositoryName	}/languages`)
    const languagesKeys = Object.keys(response.data)
    setLanguagesState(languagesKeys)
  }

  /**
   * Altera o número da página atual
   * @param {*} page número da nova página (padrão = 1)
   */
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

    setIsPossibleCallApi(true)
  }

  /**
   * Buscar todos os dados pelo nome do repositório
   * @param {*} repositoryName nome do do repositório
   * @param {*} page página de listagem do repositório (padrão = 1)
   * @returns void
   */
  async function getDataRepositories(repositoryName, page = 1) {

    if (repositoryName.trim() === "") {
      return;
    }
    
    setIsPossibleCallApi(false)
    setCurrentPageInParams(page)

    const response = await api.get(`/search/repositories?q=${repositoryName}&per_page=7&page=${page}`)
    
    if (response.status === 200) {
      const totalPages = calculateTotalPages(response.data.total_count / 7)

      setData({ ...response.data, totalPages })
      setCurrentRepositoryName(repositoryName)

      await getTopicsFromRepository(repositoryName)
      await getCommitsFromRepository(repositoryName)

      setIsPossibleCallApi(true)
      
      return {
        items: response.data,
        total_count: response.data.total_count,
        totalPages
      }
    }

    setIsPossibleCallApi(true)
    return;
  }

  /**
   * Busca todos os tópicos do repositório pelo nome
   * @param {*} repositoryName nome do repositório
   * @returns void
   */
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
  
  /**
   * Buscar todos os commits do repositório pelo nome
   * @param {*} repositoryName nome do repositório
   * @returns void
   */
  async function getCommitsFromRepository(repositoryName) {
    if (repositoryName.trim() === "") {
      return;
    }

    const response = await api.get(`/search/commits?q=${repositoryName}`)
    if (response.status === 200) {
      setCommits({ total_count: response.data.total_count })
      return response.data  
    }
  }

    /**
   * Recupera todas as issues utilizadas por um repositório
   * @param {*} username nome de usuário do criador do repositório
   * @param {*} repositoryName nome do repositório
   * @param {*} setIssuesDataState função para setar o estado
   * @returns void
   */
  async function getIssuesFromRepository(username, repositoryName, setIssuesDataState) {
    if (repositoryName.trim() === "" || username.trim() === "") {
      return;
    }

    const response = await api.get(`/search/issues?q=repo:${username}/${repositoryName}`)
    if (response.status === 200) {
      setIssuesDataState({ total_count: response.data.total_count, items: response.data.items })
    }
  }

  return (
    <DataContext.Provider value={{
      data,
      currentPage,
      handleSetCurrentPage,
      getDataRepositories,
      topics,
      getLanguages,
      getIssuesFromRepository,
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
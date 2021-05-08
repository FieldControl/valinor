import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import api from '../utils/api'

interface RequestQuerysData {
  search: string | null;
  typeSearch: string;
  page: number;
  sort: string
}

interface QueryData {
  requestQuerys: RequestQuerysData;
  count: number;
  items: itemsTypes[];
  setRequestQuerys: React.Dispatch<React.SetStateAction<RequestQuerysData>>;
  request: () => void;
}

interface QueryContextProviderProps {
  children: ReactNode
}

interface LicenseData {
  key: string;
  name: string;
  url: string;
  node_id: string;
}

interface itemsTypes {
  id: number,
  node_id: string,
  name: string,
  full_name: string,
  title: string,
  private: boolean,
  html_url: string,
  description: string,
  fork: boolean,
  url: string,
  created_at: string,
  updated_at: string,
  pushed_at: string,
  language: string,
  license: null | LicenseData,
  watchers: number,
}

export const QueryContext = createContext({} as QueryData )

export function QueryContextProvider ({children}: QueryContextProviderProps) {
  const [requestQuerys, setRequestQuerys] = useState({
    search: null as string | null,
    typeSearch: 'repositories',
    page: 1,
    sort: 'full_name'
  })

  const [count, setCount] = useState(0)
  const [items, setItems] = useState([] as itemsTypes[])

  const request =  useCallback(() => {
    let {search, typeSearch, page, sort} = requestQuerys

    api.get(`/search/${typeSearch}?q=${search}&per_page=10&page=${page}&sort=${sort}`, {
      headers: {
        "Accept": "application/vnd.github.v3+json"
      }
    }).then((response) => {
      setCount(response.data["total_count"])
      setItems(response.data["items"])
    })
  }, [requestQuerys])

  useEffect(() => {
    if (requestQuerys.search !== null) {
      request()
    }
  }, [requestQuerys, request])

  return (
    <QueryContext.Provider value={{
      requestQuerys,
      count,
      items,
      setRequestQuerys,
      request,
    }}>
      {children}
    </QueryContext.Provider>
  )
}

export const useQuery = () => {
  return useContext(QueryContext)
}
import {
  createContext,
  useState,
  useEffect,
  useContext,
} from "react";
import { toast } from 'react-toastify'
import { api } from "../services/api";

interface RepositoryProps {
  id: number;
  stargazers_count: number;
  watchers_count: number;
  open_issues_count: number;
  full_name: string;
  html_url: string;
  description: string;
  language: string;
}

interface Repository {
  total_count: number;
  items: RepositoryProps[];
}

interface RepositoryData {
  LIMIT: number;
  Pageinfo: Repository;
  page: number;
  setPageinfo: React.Dispatch<React.SetStateAction<Repository>>
  setPage: React.Dispatch<React.SetStateAction<number>>
  AddRepository(text: string): void
}


const RepositoryContext = createContext<RepositoryData>({} as RepositoryData);


export const RepositoryProvider: React.FC = ({ children }) => {
  const LIMIT = 8;
  const [page, setPage] = useState(1)
  const [Pageinfo, setPageinfo] = useState<Repository>(() => {
    const storageRepositore = localStorage.getItem('@Repositories:Items');

    if(storageRepositore){
      return JSON.parse(storageRepositore)
    }
      return ;
  });

   useEffect(() => {
     localStorage.setItem('@Repositories:Items',JSON.stringify(Pageinfo))
   },[Pageinfo])

  async function AddRepository(text: string) {
    if(text !== '') {
      try {
      const response = await api.get(`repositories?q=${text}&per_page=${LIMIT}&page=${page}`)
      setPageinfo(response.data)
      
  
      } catch (err) {
        toast.error('Houve um erro na pesquisa', {position: "top-right"});
      }
    }
  }

  return (
    <RepositoryContext.Provider value={
      {
        LIMIT,
        Pageinfo,
        page,
        setPageinfo,
        setPage,
        AddRepository,
      }}>
      {children}
    </RepositoryContext.Provider>
  )
}

export function useRepository() {
  const context = useContext(RepositoryContext)

  return context;
}
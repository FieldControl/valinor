import { createContext, ReactNode, useState } from "react";
import api from "../services/api";
import { RepoCardProps } from "../components/@interfaces/IRepoCard";

interface SearchRepo {
  children: ReactNode;
}


interface SearchRepoData {
  getRepoName: string;
  setGetRepoName: (getRepoName: string) => void;
  getRepo: (repoName: string) => void;
  repos: RepoCardProps[];
  setRepos: (repos: RepoCardProps[]) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  loading: boolean
  setLoading: (loading: boolean) =>  void
}

export const SearchRepo = createContext<SearchRepoData>(
  {} as SearchRepoData
);

export function SearchRepoProvider({ children }: SearchRepo) {
  const [getRepoName, setGetRepoName] = useState('');
  const [repos, setRepos] = useState<RepoCardProps[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  async function getRepo(repoName: string) {
    try {
      setLoading(true);
      const response = await api.get(repoName + '&per_page=100');
      const repoItems: RepoCardProps[] = response.data.items;
      setRepos(repoItems);
    } catch (error) {
      console.error('Erro na solicitação:', error);
    } finally {
      setLoading(false);
    }
  }
  
  return <SearchRepo.Provider value={
    { 
    getRepo, 
    getRepoName, 
    setGetRepoName, 
    repos, 
    setRepos, 
    currentPage, 
    setCurrentPage,
    loading,
    setLoading
  }
}>{children}</SearchRepo.Provider>;
}

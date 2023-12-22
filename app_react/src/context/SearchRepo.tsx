import { createContext, ReactNode, useEffect, useState } from "react";
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
}

export const SearchRepo = createContext<SearchRepoData>(
  {} as SearchRepoData
);

export function SearchRepoProvider({ children }: SearchRepo) {
  const [getRepoName, setGetRepoName] = useState('');
  const [repos, setRepos] = useState<RepoCardProps[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  async function getRepo(repoName: string) {
    api.get(repoName + '&per_page=100')
      .then(response => {
        const repoItems: RepoCardProps[] = response.data.items;
        setRepos(repoItems);
        console.log(repoItems)
      })
      .catch(error => {
        console.error('Erro na solicitação:', error);
      });
  }

  useEffect(() => {
    console.log('Search Repo context is working');
  }, []);

  return <SearchRepo.Provider value={{ getRepo, getRepoName, setGetRepoName, repos, setRepos, currentPage, setCurrentPage }}>{children}</SearchRepo.Provider>;
}

import { useState, useEffect } from 'react';

import { RepoItem } from '../../components/RepoItem';
import { useQuery } from '../../hooks/useQuery';
import { IRepo } from '../../interfaces/IRepo';
import { gitApi } from '../../services/gitApi';
import './styles.scss';

export function SearchPage(): JSX.Element {
  const [repos, setRepos] = useState<IRepo[]>([]);
  const [page, setPage] = useState(1);
  const query = useQuery();

  useEffect(() => {
    async function fetchRepos(): Promise<void> {
      const repo = query.get('repo');
      const ITEMS_PER_PAGE = 10;
      const { data } = await gitApi.get('search/repositories', {
        params: {
          q: repo,
          per_page: ITEMS_PER_PAGE,
          page,
        },
      });

      const { items } = data;

      setRepos(items);
    }

    fetchRepos();
  }, [page, query]);

  return (
    <main className="container">
      {repos.length > 0 ? (
        <ul>
          {repos.map(repo => (
            <RepoItem repo={repo} />
          ))}
        </ul>
      ) : (
        <h1>Nenhum repositório encontrado</h1>
      )}
    </main>
  );
}

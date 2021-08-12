import { useCallback, useState, useEffect, useMemo } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import { Pagination } from '../../components/Pagination';
import { RepoItem } from '../../components/RepoItem';
import { useQuery } from '../../hooks/useQuery';
import { IRepo } from '../../interfaces/IRepo';
import { gitApi } from '../../services/gitApi';
import './styles.scss';

export function SearchPage(): JSX.Element {
  const [repos, setRepos] = useState<IRepo[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const query = useQuery();
  const ITEMS_PER_PAGE = 8;

  const q = useMemo(() => {
    return query.get('repo');
  }, [query]);

  useEffect(() => {
    async function fetchRepos(): Promise<void> {
      setIsLoading(true);

      try {
        const { data } = await gitApi.get('search/repositories', {
          params: {
            q,
            per_page: ITEMS_PER_PAGE,
            page: currentPage,
          },
        });

        const { items, total_count } = data;

        setRepos(items);
        setTotalCount(total_count);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRepos();
  }, [currentPage, q]);

  const handlePagination = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return (
    <main className="container">
      {isLoading ? (
        <SkeletonTheme color="#202020" highlightColor="#202020">
          <Skeleton count={8} height={20} />
        </SkeletonTheme>
      ) : repos.length > 0 ? (
        <ul>
          {repos.map(repo => (
            <RepoItem key={repo.id} repo={repo} />
          ))}
        </ul>
      ) : (
        <h1>Nenhum repositório encontrado</h1>
      )}
      <Pagination
        currentPage={currentPage}
        handlePagination={handlePagination}
        itemsPerPage={ITEMS_PER_PAGE}
        totalCount={totalCount}
      />
    </main>
  );
}

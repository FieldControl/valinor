import { useState, useEffect } from 'react';
import {
  AiOutlineBook,
  AiOutlineStar,
  AiOutlineFork,
  AiOutlineEye,
  AiOutlineExclamationCircle,
} from 'react-icons/ai';

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
      <ul>
        {repos.map(repo => (
          <li key={repo.id}>
            <div className="book-icon">
              <AiOutlineBook size={16} color="#d4d4d4" />
            </div>
            <div className="repo-infos">
              <a className="fullname" href={repo.html_url}>
                {repo.full_name}
              </a>
              <span className="description">{repo.description}</span>
              <div className="counters">
                <div>
                  <AiOutlineStar />
                  <small>{repo.stargazers_count}</small>
                </div>
                <div>
                  <AiOutlineFork />
                  <small>{repo.forks_count}</small>
                </div>
                <div>
                  <AiOutlineEye />
                  <small>{repo.watchers_count}</small>
                </div>
                <div>
                  <AiOutlineExclamationCircle />
                  <small>{repo.open_issues_count}</small>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

import {
  AiOutlineBook,
  AiOutlineExclamationCircle,
  AiOutlineEye,
  AiOutlineFork,
  AiOutlineStar,
} from 'react-icons/ai';

import { IRepo } from '../../interfaces/IRepo';

import './styles.scss';

interface RepoItemProps {
  repo: IRepo;
}

export function RepoItem({ repo }: RepoItemProps): JSX.Element {
  return (
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
  );
}

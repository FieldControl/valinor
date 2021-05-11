import { formatDistanceToNowStrict } from 'date-fns';
import { Link } from 'react-router-dom';
import { MdKeyboardArrowRight, MdStarBorder } from 'react-icons/md';

import { Container } from './styles';

interface Repository {
  id: number;
  full_name: string;
  url: string;
  description: string;
  stargazers_count: number;
  language: string;
  pushed_at: Date;
  owner: {
    avatar_url: string;
    login: string;
  };
}

interface ICardProps {
  repository: Repository;
  delay: number;
}

export function Card({ repository, delay }: ICardProps) {
  return (
    <Container style={{ animationDelay: `${delay}ms` }}>
      <div>
        <img src={repository.owner.avatar_url} alt={repository.owner.login} />

        <div className="info-repo">
          <Link to={`/repository/${repository.full_name}`}>
            {repository.full_name}
          </Link>
          <p>{repository.description}</p>

          <div>
            <span className="stargazers">
              <MdStarBorder size="1rem" />
              {repository.stargazers_count >= 1000
                ? (repository.stargazers_count / 1000)
                    .toFixed(1)
                    .replace(/\.0$/, '') + 'K'
                : repository.stargazers_count}
            </span>

            <span>{repository.language}</span>

            <span>
              Updated{' '}
              {formatDistanceToNowStrict(new Date(repository.pushed_at), {
                addSuffix: true
              })}
            </span>
          </div>
        </div>
      </div>
      <Link to={`/repository/${repository.full_name}`}>
        <MdKeyboardArrowRight size="3.125rem" color="var(--gray)" />
      </Link>
    </Container>
  );
}

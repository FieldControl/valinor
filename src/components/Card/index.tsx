import { Link } from 'react-router-dom';
import { MdKeyboardArrowRight } from 'react-icons/md';

import { Container } from './styles';

interface Repository {
  id: number;
  full_name: string;
  url: string;
  description: string;
  owner: {
    avatar_url: string;
    login: string;
  };
}

interface ICardProps {
  repository: Repository;
}

export function Card({ repository }: ICardProps) {
  return (
    <Container>
      <div>
        <img src={repository.owner.avatar_url} alt={repository.owner.login} />

        <div>
          <Link to={`/repository/${repository.full_name}`}>
            {repository.full_name}
          </Link>
          <p>{repository.description}</p>
        </div>
      </div>
      <Link to={`/repository/${repository.full_name}`}>
        <MdKeyboardArrowRight size="3.125rem" color="var(--gray)" />
      </Link>
    </Container>
  );
}

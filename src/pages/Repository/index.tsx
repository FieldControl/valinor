import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MdKeyboardArrowLeft, MdOpenInNew } from 'react-icons/md';

import { Header } from '../../components/Header';
import { Container, ContentRepository } from './styles';
import { api } from '../../services/api';

type TParams = {
  username: string;
  repo_name: string;
};

type TRepository = {
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks: number;
  open_issues: number;
  owner: {
    avatar_url: string;
    login: string;
  };
};

export function Repository() {
  const { username, repo_name } = useParams<TParams>();
  const [repository, setRepository] = useState<TRepository>({
    full_name: '',
    description: '',
    stargazers_count: 0,
    forks: 0,
    open_issues: 0,
    owner: {
      avatar_url: '',
      login: ''
    }
  });

  useEffect(() => {
    (async () => {
      const response = await api.get(`repos/${username}/${repo_name}`);
      console.log(response.data);

      setRepository(response.data);
    })();
  }, []);

  return (
    <Container>
      <Header>
        <Link to="/">
          <MdKeyboardArrowLeft size="1.6rem" /> Voltar
        </Link>
      </Header>

      <ContentRepository>
        <header>
          <div className="profile">
            <img
              src={repository.owner.avatar_url}
              alt={repository.owner.login}
            />
            <div>
              <strong>{repository.full_name}</strong>
              <p>{repository.description}</p>
            </div>
          </div>
          <div className="info">
            <div>
              <span>{repository.stargazers_count}</span>
              Stars
            </div>
            <div>
              <span>{repository.forks}</span>
              Forks
            </div>
            <div>
              <span>{repository.open_issues}</span>
              Issues abertas
            </div>
          </div>
        </header>

        <a href={`https://github.com/${username}/${repo_name}`} target="blank">
          Github <MdOpenInNew />
        </a>
      </ContentRepository>
    </Container>
  );
}

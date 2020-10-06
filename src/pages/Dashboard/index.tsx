import React, { FormEvent, useCallback, useRef, useState } from 'react';
import { FiLoader } from 'react-icons/fi';

import Repository from '../../components/Repository';
import api from '../../services/api';

import logo from '../../assets/logo.png';

import { Container } from './styles';

interface IDataProps {
  total_count: number;
  items: IRepositorieDataProps[];
}

interface IRepositorieDataProps {
  id: number;
  name: string;
  owner: {
    avatar_url: string;
    html_url: string;
  };
  description: string;
  stargazers_count: number;
  watchers_count: number;
}

const Dashboard: React.FC = () => {
  const inputRepositoryRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [repositories, setRepositories] = useState<IDataProps>(
    {} as IDataProps,
  );

  const handleSearchRepository = useCallback(async (event: FormEvent): Promise<
    void
  > => {
    event.preventDefault();
    setLoading(true);
    const findRepository = inputRepositoryRef.current?.value;

    const response = await api.get('search/repositories', {
      params: { q: findRepository, per_page: 5 },
    });
    setRepositories(response.data);
    setLoading(false);
  }, []);
  return (
    <Container loading={loading}>
      <header>
        <img src={logo} alt="Walefe" />
        <h1>Github Explorer</h1>
      </header>
      <form onSubmit={handleSearchRepository}>
        <input
          ref={inputRepositoryRef}
          type="text"
          placeholder="Digite o nome do repositório"
        />
        <button type="submit">Pesquisar</button>
      </form>
      {loading ? (
        <FiLoader size={36} color="#3a3a3a" />
      ) : (
        <Repository data={repositories} />
      )}
    </Container>
  );
};

export default Dashboard;

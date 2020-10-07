import React, {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { FiLoader } from 'react-icons/fi';

import Repository from '../../components/Repository';
import api from '../../services/api';
import formatNumber from '../../utils/format';

import logo from '../../assets/logo.png';

import { Container } from './styles';

interface IDataProps {
  formatedCount: string;
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
  stargazers_format_count: string;
  watchers_format_count: string;
}

const Dashboard: React.FC = () => {
  const inputRepositoryRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [repositories, setRepositories] = useState<IDataProps>(() => {
    const storageRepositories = localStorage.getItem(
      '@GithubExplore:repositories',
    );

    if (storageRepositories) {
      return JSON.parse(storageRepositories);
    }

    return {} as IDataProps;
  });

  useEffect(() => {
    localStorage.setItem(
      '@GithubExplore:repositories',
      JSON.stringify(repositories),
    );
  }, [repositories]);

  const handleSearchRepository = useCallback(async (event: FormEvent): Promise<
    void
  > => {
    event.preventDefault();
    setLoading(true);
    const findRepository = inputRepositoryRef.current?.value;

    const response = await api.get<IDataProps>('search/repositories', {
      params: { q: findRepository, per_page: 5 },
    });

    const { items, total_count } = response.data;

    const formatResponse = {
      items: items.map(item => ({
        ...item,
        stargazers_format_count: formatNumber(item.stargazers_count),
        watchers_format_count: formatNumber(item.watchers_count),
      })),
      formatedCount: formatNumber(total_count),
      total_count,
    };

    setRepositories(formatResponse);
    setLoading(false);
  }, []);

  return (
    <Container loading={loading}>
      <header>
        <img src={logo} alt="GitHub" />
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
        <>
          <h3>{repositories.formatedCount}</h3>
          <Repository data={repositories} />
        </>
      )}
    </Container>
  );
};

export default Dashboard;

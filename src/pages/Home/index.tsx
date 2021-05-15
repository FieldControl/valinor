import { FormEvent, useState } from 'react';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import { Card } from '../../components/Card';

import { Header } from '../../components/Header';
import { api } from '../../services/api';
import { CardContainer, Container, Form } from './styles';

interface IRepository {
  total_count: number;
  items: Array<{
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
  }>;
}

export function Home() {
  const [repository, setRepository] = useState('');
  const [repositories, setRepositories] = useState<IRepository>(
    {} as IRepository
  );
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [firstSearch, setFirstSearch] = useState(true);

  const repositoriesPerPage = 10;
  const totalRepositoriesViewed = currentPage * repositoriesPerPage;
  const maxSearchResults =
    totalRepositoriesViewed >= repositories.total_count ||
    totalRepositoriesViewed >= 1000;

  async function fetchRepositories() {
    const response = await api.get(
      `/search/repositories?q=${repository}&per_page=${repositoriesPerPage}&page=${currentPage}`
    );

    return response;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!repository) return;

    setLoading(true);
    setFirstSearch(false);

    const response = await fetchRepositories();

    setRepositories(response.data);
    setLoading(false);
  }

  async function handleNextPage() {
    console.log('Line: 65', currentPage, maxSearchResults);

    console.log(
      `totalRepositoriesViewed > repositories.total_count - ${
        totalRepositoriesViewed > repositories.total_count
      }`
    );

    console.log(
      `totalRepositoriesViewed > 1000 - ${totalRepositoriesViewed > 1000}`
    );

    console.log(
      `AAA - ${
        totalRepositoriesViewed > repositories.total_count &&
        totalRepositoriesViewed > 1000
      }`
    );

    if (maxSearchResults) return;

    setCurrentPage(currentPage + 1);

    const response = await fetchRepositories();
    setRepositories(response.data);
  }

  async function handlePrevPage() {
    if (currentPage <= 1) return;

    setCurrentPage(currentPage - 1);

    const response = await fetchRepositories();
    setRepositories(response.data);
  }

  return (
    <Container>
      <Header />

      <h1>Explore repositórios no Github.</h1>

      <Form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Digite aqui"
          value={repository}
          onChange={(e) => setRepository(e.target.value)}
        />

        <button type="submit">Pesquisar</button>
      </Form>

      <main>
        <CardContainer>
          {loading ? (
            <div className="loader" />
          ) : repositories.total_count > 0 ? (
            <>
              {repositories.items.map((repository, index) => (
                <Card
                  key={repository.id}
                  repository={repository}
                  delay={index * 100}
                />
              ))}
              <div className="pagination">
                <button onClick={handlePrevPage} disabled={currentPage <= 1}>
                  <MdKeyboardArrowLeft /> Prev
                </button>

                <button onClick={handleNextPage} disabled={maxSearchResults}>
                  Next <MdKeyboardArrowRight />
                </button>
              </div>
            </>
          ) : (
            !firstSearch && (
              <span className="notFound">
                Não foi possível encontrar nenhum repositório ):
              </span>
            )
          )}
        </CardContainer>
      </main>
    </Container>
  );
}

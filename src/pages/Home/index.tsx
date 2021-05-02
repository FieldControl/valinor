import { FormEvent, useState } from 'react';
import { Card } from '../../components/Card';

import { Header } from '../../components/Header';
import { api } from '../../services/api';
import { CardContainer, Container, Form } from './styles';

interface IRepository {
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

export function Home() {
  const [repository, setRepository] = useState('');
  const [repositories, setRepositories] = useState<IRepository[]>([]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const response = await api.get(
      `/search/repositories?q=${repository}&per_page=10`
    );
    setRepositories(response.data.items);
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
          {repositories &&
            repositories.map((repository) => (
              <Card key={repository.id} repository={repository} />
            ))}
        </CardContainer>
      </main>
    </Container>
  );
}

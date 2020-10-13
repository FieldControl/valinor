import React, { useEffect, useState } from 'react';
import { useRouteMatch } from 'react-router-dom';

import api from '../../services/api';

import {
  Wrapper,
  Container,
  Header,
  ContainerCard,
  HeaderCard,
} from './styles';

interface IRepositoryParams {
  repository: string;
}

interface Issue {
  id: number;
  title: string;
  html_url: string;
  user: {
    login: string;
  };
  labels: ILabels[];
  state: string;
}

interface ILabels {
  name: string;
  color: string;
}

const Issues: React.FC = () => {
  const { params } = useRouteMatch<IRepositoryParams>();

  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    api.get(`repos/${params.repository}/issues`).then(response => {
      setIssues(response.data);
    });
  }, [params.repository]);

  return (
    <Wrapper>
      <Header>
        <h1>Issues</h1>
      </Header>
      <Container>
        {issues.map(issue => (
          <ContainerCard href={issue.html_url} target="_blank" key={issue.id}>
            <HeaderCard state={issue.state}>
              <h2>{issue.user.login}</h2>
              <span>{issue.state}</span>
            </HeaderCard>
            <p>{issue.title}</p>
          </ContainerCard>
        ))}
      </Container>
    </Wrapper>
  );
};

export default Issues;

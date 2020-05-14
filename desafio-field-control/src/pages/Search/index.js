import React, { useState, useEffect, useCallback } from 'react';
import {
  FaSearch,
  FaStar,
  FaCodeBranch,
  FaEye,
  FaSpinner,
} from 'react-icons/fa';
import { useLocation, useHistory } from 'react-router-dom';
import {
  Container,
  Input,
  Button,
  InputGroup,
  InputGroupAddon,
  Row,
  Col,
} from 'reactstrap';

import logo from '~/assets/logo.png';
import Pagination from '~/components/Pagination';
import summarizeNumbers from '~/lib/summarizeNumbers';
import api from '~/services/api';

import './styles.css';

function Search() {
  const [repositories, setRepositories] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limitPage, setLimitPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const queryParams = useLocation().search;
  const history = useHistory();

  useEffect(() => {
    async function sideEffects() {
      setLoading(true);

      const query = new URLSearchParams(queryParams);
      setSearch(query.get('q'));

      const response = await api('repositories', {
        params: {
          q: query.get('q'),
          page,
          per_page: 10,
        },
      });

      const checkPageLimit = response.data.total_count / 10;

      setLimitPage(checkPageLimit > 100 ? 100 : parseInt(checkPageLimit, 10));
      setRepositories(response.data);
      setLoading(false);
    }

    sideEffects();
  }, [page, queryParams]);

  const handleSearch = useCallback(() => {
    history.replace({
      pathname: '/search',
      search: `?q=${search}`,
    });

    setPage(1);
  }, [history, search]);

  return (
    <>
      <div id="header">
        <a href="/">
          <img className="header-logo" src={logo} alt="Octacat Logo" />
        </a>
        <InputGroup className="mb-2">
          <Input
            id="search"
            name="search"
            placeholder="Pesquisar..."
            onKeyPress={e => e.which === 13 && handleSearch()}
            onChange={event => setSearch(event.target.value)}
            value={search}
            autoFocus
            required
            autoComplete="off"
          />
          <InputGroupAddon addonType="append">
            <Button
              type="submit"
              color="primary"
              onClick={() => handleSearch()}
            >
              <FaSearch />
            </Button>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <Container fluid className="content">
        {!loading ? (
          <Row>
            <Col xs="12" md="12" xl="6">
              {repositories.total_count > 0 ? (
                <>
                  <small className="text-muted">
                    Foi encontrado {summarizeNumbers(repositories.total_count)}{' '}
                    repositório(s)
                  </small>
                  <ul className="repo-list">
                    {repositories.items.map(repository => (
                      <li key={repository.id} className="repo-list-item py-2">
                        <div className="repo-title">
                          <a
                            href={repository.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {repository.full_name}
                          </a>
                        </div>
                        <p className="mb-1">{repository.description}</p>
                        <div className="info d-flex flex-wrap text-small text-muted text-secondary">
                          <div>
                            <FaStar />{' '}
                            {summarizeNumbers(repository.stargazers_count)}
                          </div>
                          <div>{repository.language}</div>
                          <div>
                            <FaCodeBranch />{' '}
                            {summarizeNumbers(repository.forks_count)}
                          </div>
                          <div>
                            <FaEye /> {summarizeNumbers(repository.watchers)}
                          </div>
                        </div>
                        <hr />
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <span>Sua pesquisa não encontrou nenhum repositório</span>
              )}

              <Pagination
                limitPage={limitPage}
                handleClick={setPage}
                currentPage={page}
              />
            </Col>
          </Row>
        ) : (
          <FaSpinner size="36" color="#e07e04" className="loading" />
        )}
      </Container>
    </>
  );
}

export default Search;

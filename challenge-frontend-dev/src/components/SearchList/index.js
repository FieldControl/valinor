import React, { Component } from 'react';

import api from '../../services/api';

import { MdStar } from 'react-icons/md';
import { FaBook, FaCodeBranch, FaEye } from 'react-icons/fa';

import Container from '../../components/Container';

import { SearchList, Pagination } from './styles';

export default class Repository extends Component {
  state = {
    repositories: [],
    searchCounter: {},
    page: null,
    nextPage: false,
    newRepo: '',
  };

  handleInputChange = e => this.setState({ newRepo: e.target.value });

  handleSubmit = async e => {
    e.preventDefault();

    const { newRepo, page } = this.state;

    localStorage.setItem('newRepo', newRepo);

    const [repositories] = await Promise.all([
      api.get(`/search/repositories?q=${newRepo}`, {
        params: {
          per_page: 10,
          page,
        },
      }),
    ]);

    this.setState({
      repositories: repositories.data.items,
      newRepo: '',
      searchCounter: repositories.data,
      page: 1,
      nextPage: Boolean(
        repositories.headers.link && repositories.headers.link.includes('next')
      ),
    });
  };

  handlePageChange = async page => {
    const newRepo = localStorage.getItem('newRepo');

    const repositories = await api.get(`/search/repositories?q=${newRepo}`, {
      params: {
        per_page: 10,
        page,
      },
    });

    this.setState({
      repositories: repositories.data.items,
      searchCounter: repositories.data,
      page,
      nextPage: Boolean(
        repositories.headers.link && repositories.headers.link.includes('next')
      ),
    });
  };

  render() {
    const { newRepo, repositories, searchCounter, page, nextPage } = this.state;

    return (
      <Container>
        <form onSubmit={this.handleSubmit}>
          <input
            type="type"
            value={newRepo}
            onChange={this.handleInputChange}
            placeholder="Search or jump to..."
          />
        </form>

        <SearchList>
          <h2>{searchCounter.total_count} repository results</h2>

          {repositories.map(repository => (
            <li key={String(repository.id)}>
              <FaBook size={16} color="#363636" />
              <a
                href={repository.html_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {repository.owner.login}/<em>{repository.name}</em>
              </a>

              <p>
                <span>{repository.description}</span>
              </p>

              <div>
                <p>
                  <div>
                    <a
                      href={`https://github.com/${repository.full_name}/stargazers`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MdStar size={16} />
                      {repository.stargazers_count}
                    </a>
                  </div>
                </p>

                <p>
                  <div>
                    <a
                      href={`https://github.com/${repository.full_name}/network/members`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaCodeBranch size={13} />
                      {repository.forks_count}
                    </a>
                  </div>
                </p>

                <p>
                  <div>{repository.language}</div>
                </p>

                <p>
                  <div>
                    <a
                      href={`https://github.com/${repository.full_name}/watchers`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaEye size={13} />
                      {repository.watchers_count}
                    </a>
                  </div>
                </p>

                <p>
                  <div>
                    <a
                      href={
                        `https://github.com/` +
                        repository.full_name +
                        `/issues?q=is%3Aopen`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {repository.open_issues_count} issues needs help
                    </a>
                  </div>
                </p>
              </div>
            </li>
          ))}
        </SearchList>

        <Pagination>
          {page > 1 && (
            <button
              type="button"
              className="previous"
              onClick={() => this.handlePageChange(page - 1)}
            >
              Previous
            </button>
          )}
          {nextPage && (
            <button
              type="button"
              className="next"
              onClick={() => this.handlePageChange(page + 1)}
            >
              Next
            </button>
          )}
        </Pagination>
      </Container>
    );
  }
}

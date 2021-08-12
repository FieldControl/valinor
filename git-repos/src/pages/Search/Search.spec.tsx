import MockAdapter from 'axios-mock-adapter';

import { render, screen, waitFor } from '@testing-library/react';

import { SearchPage } from '.';
import { gitApi } from '../../services/gitApi';

const mockGitApi = new MockAdapter(gitApi);

jest.mock('../../hooks/useTheme', () => {
  return {
    useTheme: () => ({
      theme: 'light',
    }),
  };
});

jest.mock('react-router-dom', () => {
  return {
    useLocation: () => ({
      search: 'node',
    }),
  };
});

describe('Search page', () => {
  it('should renders correctly', async () => {
    const apiResponse = {
      items: [
        {
          id: Math.random(),
          full_name: 'Test',
          description: 'Test repository',
          forks_count: 5,
          html_url: '#',
          open_issues_count: 6,
          stargazers_count: 7,
          watchers_count: 2,
        },
      ],
      total_count: 1,
    };

    mockGitApi.onGet('search/repositories').replyOnce(200, apiResponse);

    render(<SearchPage />);

    const fullName = await waitFor(() => screen.getByText('Test'), {
      timeout: 200,
    });

    const description = await waitFor(
      () => screen.getByText('Test repository'),
      {
        timeout: 200,
      }
    );

    expect(fullName).toBeInTheDocument();
    expect(description).toBeInTheDocument();
  });

  it('should renders repo not found message', async () => {
    mockGitApi.onGet('search/repositories').replyOnce(404);

    render(<SearchPage />);

    const notFoundMessage = await waitFor(
      () => screen.getByText('Nenhum repositório encontrado'),
      {
        timeout: 200,
      }
    );

    expect(notFoundMessage).toBeInTheDocument();
  });
});

import React from 'react';
import { cleanup } from '@testing-library/react';
import { render, fireEvent, screen } from '../test-utils';
import GroupButtons from './GroupButtons';
import { oneAndTenMillion, hundredAndTenThousand, hundredAndThousand,
} from '../mocks/groupButton';

beforeAll(() => {
  localStorage.setItem('lastGitHubApiCallUrl', JSON.stringify('https://api.github.com/search/repositories?q=node&client_id=3ff6e9bf539fc9c40c0f&client_secret=85625306aebc569d0a939d712a6da69f76a73a5f'));
});

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

describe('GroupButtons component', () => {
  it('should render 1M and 14M when counts are up to one and ten millions', () => {
    render(<GroupButtons />, { initialState: oneAndTenMillion });

    const repositories = screen.getAllByText(/repositories/i);
    expect(repositories.length).toBe(1);
    expect(repositories[0].lastChild).toHaveTextContent('1M');

    const issues = screen.getAllByText(/issues/i);
    expect(issues.length).toBe(1);
    expect(issues[0].lastChild).toHaveTextContent('14M');
  });

  it('should render 10K and 144K when counts are up to ten and hundred thousand', () => {
    render(<GroupButtons />, { initialState: hundredAndTenThousand });

    const repositories = screen.getAllByText(/repositories/i);
    expect(repositories.length).toBe(1);
    expect(repositories[0].lastChild).toHaveTextContent('10K');

    const issues = screen.getAllByText(/issues/i);
    expect(issues.length).toBe(1);
    expect(issues[0].lastChild).toHaveTextContent('144K');
  });

  it('should render 500 and 14K when counts are between zero and one hundred', () => {
    render(<GroupButtons />, { initialState: hundredAndThousand });

    const issues = screen.getAllByText(/issues/i);
    expect(issues.length).toBe(1);
    expect(issues[0].lastChild).toHaveTextContent('14K');

    const repositories = screen.getAllByText(/repositories/i);
    expect(repositories.length).toBe(1);
    expect(repositories[0].lastChild).toHaveTextContent('500');
  });

  it('should be able to click on button Issues when enabled', () => {
    render(<GroupButtons />, { initialState: hundredAndTenThousand });

    const issuesBtn = screen.getAllByText(/issues/i);

    fireEvent.click(issuesBtn[0]);
  });

  it('should be able to click on button Repositories when enabled', () => {
    render(<GroupButtons />, { initialState: hundredAndTenThousand });

    const repositoriesBtn = screen.getAllByText(/repositories/i);

    fireEvent.click(repositoriesBtn[0]);
  });
});

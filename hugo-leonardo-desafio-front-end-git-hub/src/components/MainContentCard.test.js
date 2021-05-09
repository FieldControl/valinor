import React from 'react';
import { cleanup } from '@testing-library/react';
import { render } from '../test-utils';
import MainContentCard from './MainContentCard';

import repositories from '../mocks/repositories';
import issues from '../mocks/issues';

const initialState = {
  repositories: {
    input: 'node',
    totalCount: 1084045,
    incompleteResults: false,
    sortBy: '',
    isSelected: true,
    results: repositories,
  },
  issues: {
    input: '',
    totalCount: 14474047,
    incompleteResults: false,
    results: issues,
  },
  pagination: {
    query: 'page=1',
    baseCount: 3,
  },
};

beforeAll(() => {
  localStorage.setItem('lastGitHubApiCallUrl', JSON.stringify('https://api.github.com/search/repositories?q=node&client_id=3ff6e9bf539fc9c40c0f&client_secret=85625306aebc569d0a939d712a6da69f76a73a5f'));
});

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

describe('MainContentCard component', () => {
  it('should render main content card for repositories', () => {
    render(<MainContentCard
      title={ repositories.items[0].html_url }
      text={ repositories.items[0].description }
      links={ repositories.items[0].url }
      footer={ repositories.items[0].updated_at }
      stargazersUrl={ repositories.items[0].stargazers_url }
      stargazersCount={ repositories.items[0].stargazers_count }
      openIssuesCount={ repositories.items[0].open_issues_count }
      language={ repositories.items[0].language }
    />, { initialState });
  });

  it('should render main content card for issues', () => {
    render(<MainContentCard
      url={ issues.items[0].repository_url }
      title={ issues.items[0].title }
      text={ issues.items[0].user.login }
      links={ issues.items[0].html_url }
      footer={ issues.items[0].created_at }
      status={ issues.items[0].state }
      comments={ issues.items[0].comments }
      description={
        issues.items[0].labels.length > 0 ? issues.items[0].labels[0].description : ''
      }
      dependencies={
        issues.items[0].labels.length > 0 ? issues.items[0].labels[0].name : ''
      }
    />, { initialState });
  });
});

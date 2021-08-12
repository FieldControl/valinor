import { render, screen } from '@testing-library/react';

import { RepoItem } from '.';
import { IRepo } from '../../interfaces/IRepo';

describe('RepoItem component', () => {
  it('should renders correctly', () => {
    const repo: IRepo = {
      id: Math.random(),
      full_name: 'Test',
      description: 'Test repository',
      forks_count: 5,
      html_url: '#',
      open_issues_count: 6,
      stargazers_count: 7,
      watchers_count: 2,
    };

    render(<RepoItem repo={repo} />);

    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('Test repository')).toBeInTheDocument();
  });
});

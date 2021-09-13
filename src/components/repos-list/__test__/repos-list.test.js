import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ContextProvider } from '../../../context/data-provider';
import ReposList from '../repos-list';

const MockReposList = () => {
  return (
    <BrowserRouter>
      <ContextProvider>
        <ReposList />
      </ContextProvider>
    </BrowserRouter>
  );
};

describe('ReposList', () => {
  test('should render repo list', async () => {
    render(<MockReposList />);
    const repoElement = await screen.findByTestId('repo-item-0');
    expect(repoElement).toBeInTheDocument;
  });
});

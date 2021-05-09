import React from 'react';
import { cleanup } from '@testing-library/react';
// We're using our own custom render function and not RTL's render
// our custom utils also re-export everything from RTL
// so we can import fireEvent and screen here as well
import { render, screen } from '../test-utils';
import MainContent from './MainContent';
import { initialState, initialStateSelected,
  initialStateError } from '../constants/initialState';

beforeAll(() => {
  localStorage.setItem('lastGitHubApiCallUrl', 'https://api.github.com/search/repositories?q=node&client_id=3ff6e9bf539fc9c40c0f&client_secret=85625306aebc569d0a939d712a6da69f76a73a5f');
});

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

describe('MainContent component', () => {
  it('should renders repositories main content cards', () => {
    render(<MainContent />, { initialState: initialStateSelected });

    const repositoriesResults = screen.getAllByText(/repositories results/i);

    expect(repositoriesResults.length).toBe(1);
  });

  it('should renders issues main content cards', () => {
    render(<MainContent />, { initialState });

    const issuesResults = screen.getAllByText(/issues results/i);

    expect(issuesResults.length).toBe(1);
  });

  it('should renders modal when has an error string', () => {
    render(<MainContent />, { initialState: initialStateError });
  });
});

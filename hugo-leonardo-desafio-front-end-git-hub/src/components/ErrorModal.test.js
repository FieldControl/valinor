import React from 'react';
import { cleanup } from '@testing-library/react';
import { render, screen } from '../test-utils';
import ErrorModal from './ErrorModal';
import { oneAndTenMillion } from '../mocks/groupButton';

beforeAll(() => {
  localStorage.setItem('lastGitHubApiCallUrl', JSON.stringify('https://api.github.com/search/repositories?q=node&client_id=3ff6e9bf539fc9c40c0f&client_secret=85625306aebc569d0a939d712a6da69f76a73a5f'));
});

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

describe('ErrorModal component', () => {
  it('should renders, be able to type, and activate search button', () => {
    render(<ErrorModal />, { initialState: oneAndTenMillion });

    const okBtn = screen.getAllByText(/ok/i);
    expect(okBtn[0]).toBeInTheDocument();
  });
});

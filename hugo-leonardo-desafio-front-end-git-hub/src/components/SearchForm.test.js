import React from 'react';
import { cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../test-utils';
import SearchForm from './SearchForm';
import { oneAndTenMillion } from '../mocks/groupButton';
import repositories from '../mocks/repositories';

beforeAll(() => {
  localStorage.setItem('lastGitHubApiCallUrl', JSON.stringify('https://api.github.com/search/repositories?q=node&client_id=3ff6e9bf539fc9c40c0f&client_secret=85625306aebc569d0a939d712a6da69f76a73a5f'));
});

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

describe('SearchForm component', () => {
  it('should renders, be able to type, and activate search button', () => {
    render(<SearchForm />, { initialState: oneAndTenMillion });

    const inputText = screen.getAllByPlaceholderText(/type a query/i);
    const searchBtn = screen.getAllByText(/search/i);

    expect(inputText.length).toBe(1);
    expect(searchBtn.length).toBe(1);
    expect(searchBtn[0]).toHaveClass('btn btn-secondary');
    expect(searchBtn[0]).toBeDisabled();

    userEvent.type(inputText[0], 'Testing Library');

    expect(searchBtn[0]).toHaveClass('btn btn-secondary');
    expect(searchBtn[0]).not.toBeDisabled();
  });

  it('should fetch GitHubApi when click on search button with query', () => {
    const apiResponse = Promise.resolve({
      json: () => Promise.resolve(repositories),
      ok: true,
    });

    const mockedExchange = jest.spyOn(global, 'fetch')
      .mockImplementation(() => apiResponse);
    render(<SearchForm />, { initialState: oneAndTenMillion });

    const inputText = screen.getAllByPlaceholderText(/type a query/i);
    const searchBtn = screen.getAllByText(/search/i);

    userEvent.type(inputText[0], 'Testing Library');
    userEvent.click(searchBtn[0]);

    expect(mockedExchange).toBeCalled();
    expect(mockedExchange).toBeCalledTimes(1);
    expect(mockedExchange).toBeCalledWith('https://api.github.com/search/repositories?q=Testing Library&page=1&client_id=3ff6e9bf539fc9c40c0f&client_secret=85625306aebc569d0a939d712a6da69f76a73a5f');
  });
});

import React from 'react';
import { cleanup } from '@testing-library/react';

import userEvent from '@testing-library/user-event';
import { render, screen } from '../test-utils';
import IssuesSortDropDown from './IssuesSortDropDown';
import { hundredAndTenThousand } from '../mocks/groupButton';
import repositories from '../mocks/repositories';

beforeAll(() => {
  localStorage.setItem('lastGitHubApiCallUrl', JSON.stringify('https://api.github.com/search/repositories?q=node&client_id=3ff6e9bf539fc9c40c0f&client_secret=85625306aebc569d0a939d712a6da69f76a73a5f'));
});

beforeEach(() => {
  cleanup();
});

afterEach(() => jest.clearAllMocks());

describe('IssuesSortDropDown component', () => {
  it('should renders, be able to type, and activate search button', async () => {
    render(<IssuesSortDropDown />, { initialState: hundredAndTenThousand });

    const pageFive = screen.getAllByText(/best match/i);

    expect(pageFive.length).toBe(2);

    userEvent.click(pageFive[0]);
  });

  it('should renders, be able to type, and activate search button', async () => {
    const apiResponse = Promise.resolve({
      json: () => Promise.resolve(repositories),
      ok: true,
    });

    const mockedExchange = jest.spyOn(global, 'fetch')
      .mockImplementation(() => apiResponse);

    render(<IssuesSortDropDown />, { initialState: hundredAndTenThousand });

    const pageFive = screen.getAllByText(/most commented/i);

    expect(pageFive.length).toBe(1);

    userEvent.click(pageFive[0]);

    expect(mockedExchange).toHaveBeenCalled();
    expect(mockedExchange).toHaveBeenCalledTimes(1);
    expect(mockedExchange).toHaveBeenCalledWith('https://api.github.com/search/issues?q=node&sort=comments&page=1&client_id=3ff6e9bf539fc9c40c0f&client_secret=85625306aebc569d0a939d712a6da69f76a73a5f');
  });

  it('should renders, be able to type, and activate search button', async () => {
    const apiResponse = Promise.resolve({
      json: () => Promise.resolve(repositories),
      ok: true,
    });

    const mockedExchange = jest.spyOn(global, 'fetch')
      .mockImplementation(() => apiResponse);

    render(<IssuesSortDropDown />, { initialState: hundredAndTenThousand });

    const pageFive = screen.getAllByText(/fewest commented/i);

    expect(pageFive.length).toBe(1);

    userEvent.click(pageFive[0]);

    expect(mockedExchange).toHaveBeenCalled();
    expect(mockedExchange).toHaveBeenCalledTimes(1);
    expect(mockedExchange).toHaveBeenCalledWith('https://api.github.com/search/issues?q=node&sort=comments&order=asc&page=1&client_id=3ff6e9bf539fc9c40c0f&client_secret=85625306aebc569d0a939d712a6da69f76a73a5f');
  });

  it('should renders, be able to type, and activate search button', async () => {
    const apiResponse = Promise.resolve({
      json: () => Promise.resolve(repositories),
      ok: true,
    });

    const mockedExchange = jest.spyOn(global, 'fetch')
      .mockImplementation(() => apiResponse);

    render(<IssuesSortDropDown />, { initialState: hundredAndTenThousand });

    const pageFive = screen.getAllByText(/newest/i);

    expect(pageFive.length).toBe(1);

    userEvent.click(pageFive[0]);

    expect(mockedExchange).toHaveBeenCalled();
    expect(mockedExchange).toHaveBeenCalledTimes(1);
    expect(mockedExchange).toHaveBeenCalledWith('https://api.github.com/search/issues?q=node&sort=created&page=1&client_id=3ff6e9bf539fc9c40c0f&client_secret=85625306aebc569d0a939d712a6da69f76a73a5f');
  });

  it('should renders, be able to type, and activate search button', async () => {
    const apiResponse = Promise.resolve({
      json: () => Promise.resolve(repositories),
      ok: true,
    });

    const mockedExchange = jest.spyOn(global, 'fetch')
      .mockImplementation(() => apiResponse);

    render(<IssuesSortDropDown />, { initialState: hundredAndTenThousand });

    const pageFive = screen.getAllByText(/oldest/i);

    expect(pageFive.length).toBe(1);

    userEvent.click(pageFive[0]);

    expect(mockedExchange).toHaveBeenCalled();
    expect(mockedExchange).toHaveBeenCalledTimes(1);
    expect(mockedExchange).toHaveBeenCalledWith('https://api.github.com/search/issues?q=node&sort=created&order=asc&client_id=3ff6e9bf539fc9c40c0f&client_secret=85625306aebc569d0a939d712a6da69f76a73a5f');
  });

  it('should renders, be able to type, and activate search button', async () => {
    const apiResponse = Promise.resolve({
      json: () => Promise.resolve(repositories),
      ok: true,
    });

    const mockedExchange = jest.spyOn(global, 'fetch')
      .mockImplementation(() => apiResponse);

    render(<IssuesSortDropDown />, { initialState: hundredAndTenThousand });

    const pageFive = screen.getAllByText(/recently/i);

    expect(pageFive.length).toBe(2);

    userEvent.click(pageFive[0]);

    expect(mockedExchange).toHaveBeenCalled();
    expect(mockedExchange).toHaveBeenCalledTimes(1);
    expect(mockedExchange).toHaveBeenCalledWith('https://api.github.com/search/issues?q=node&sort=updated&order=desc&client_id=3ff6e9bf539fc9c40c0f&client_secret=85625306aebc569d0a939d712a6da69f76a73a5f');
  });
  it('should renders, be able to type, and activate search button', async () => {
    const apiResponse = Promise.resolve({
      json: () => Promise.resolve(repositories),
      ok: true,
    });

    const mockedExchange = jest.spyOn(global, 'fetch')
      .mockImplementation(() => apiResponse);

    render(<IssuesSortDropDown />, { initialState: hundredAndTenThousand });

    const pageFive = screen.getAllByText(/least/i);

    expect(pageFive.length).toBe(1);

    userEvent.click(pageFive[0]);

    expect(mockedExchange).toHaveBeenCalled();
    expect(mockedExchange).toHaveBeenCalledTimes(1);
    expect(mockedExchange).toHaveBeenCalledWith('https://api.github.com/search/issues?q=node&sort=updated&order=asc&client_id=3ff6e9bf539fc9c40c0f&client_secret=85625306aebc569d0a939d712a6da69f76a73a5f');
  });
});

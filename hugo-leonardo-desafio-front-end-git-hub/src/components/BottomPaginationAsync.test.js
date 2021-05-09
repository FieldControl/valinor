import React from 'react';
import { cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../test-utils';
import BottomPagination from './BottomPagination';
import { oneAndTenMillion } from '../mocks/groupButton';
import repositories from '../mocks/repositories';

beforeAll(() => {
  localStorage.setItem('reposBaseUrl', JSON.stringify('https://api.github.com/search/repositories?q=node&client_id=3ff6e9bf539fc9c40c0f&client_secret=85625306aebc569d0a939d712a6da69f76a73a5f'));
});

beforeEach(() => {
  cleanup();
});

afterEach(() => jest.clearAllMocks());

describe('BottomPagination component', () => {
  it('should renders, be able to type, and activate search button', async () => {
    const apiResponse = Promise.resolve({
      json: () => Promise.resolve(repositories),
      ok: true,
    });

    const mockedExchange = jest.spyOn(global, 'fetch')
      .mockImplementation(() => apiResponse);

    render(<BottomPagination />, { initialState: oneAndTenMillion });

    const pageFive = screen.getAllByText(/5/i);

    expect(pageFive.length).toBe(1);

    userEvent.click(pageFive[0]);

    expect(await screen.findByText(/7/i)).toBeInTheDocument();

    expect(mockedExchange).toHaveBeenCalled();
    expect(mockedExchange).toHaveBeenCalledTimes(1);
    expect(mockedExchange).toHaveBeenCalledWith('https://api.github.com/search/repositories?q=node&client_id=3ff6e9bf539fc9c40c0f&client_secret=85625306aebc569d0a939d712a6da69f76a73a5f');
  });

  it('should renders, be able to type, and activate search button', async () => {
    const apiResponse = Promise.resolve({
      json: () => Promise.resolve(repositories),
      ok: true,
    });

    const mockedExchange = jest.spyOn(global, 'fetch')
      .mockImplementation(() => apiResponse);
    render(<BottomPagination />, { initialState: oneAndTenMillion });

    const pageFive = screen.getAllByText(/4/i);

    expect(pageFive.length).toBe(1);

    userEvent.click(pageFive[0]);

    expect(await screen.findByText(/6/i)).toBeInTheDocument();

    expect(mockedExchange).toHaveBeenCalled();
    expect(mockedExchange).toHaveBeenCalledTimes(1);
    expect(mockedExchange).toHaveBeenCalledWith('https://api.github.com/search/repositories?q=node&client_id=3ff6e9bf539fc9c40c0f&client_secret=85625306aebc569d0a939d712a6da69f76a73a5f');
  });

  it('should renders, be able to type, and activate search button', async () => {
    const apiResponse = Promise.resolve({
      json: () => Promise.resolve(repositories),
      ok: true,
    });

    const mockedExchange = jest.spyOn(global, 'fetch')
      .mockImplementation(() => apiResponse);
    render(<BottomPagination />, { initialState: oneAndTenMillion });

    const pageFive = screen.getAllByText(/1/i);

    expect(pageFive.length).toBe(1);

    userEvent.click(pageFive[0]);

    expect(await screen.findByText(/5/i)).toBeInTheDocument();

    expect(mockedExchange).toHaveBeenCalled();
    expect(mockedExchange).toHaveBeenCalledTimes(1);
    expect(mockedExchange).toHaveBeenCalledWith('https://api.github.com/search/repositories?q=node&client_id=3ff6e9bf539fc9c40c0f&client_secret=85625306aebc569d0a939d712a6da69f76a73a5f');
  });

  it('should renders, be able to type, and activate search button', async () => {
    const apiResponse = Promise.resolve({
      json: () => Promise.resolve(repositories),
      ok: true,
    });

    const mockedExchange = jest.spyOn(global, 'fetch')
      .mockImplementation(() => apiResponse);
    render(<BottomPagination />, { initialState: oneAndTenMillion });

    const pageFive = screen.getAllByText(/2/i);

    expect(pageFive.length).toBe(1);

    userEvent.click(pageFive[0]);

    expect(await screen.findByText(/5/i)).toBeInTheDocument();

    expect(mockedExchange).toHaveBeenCalled();
    expect(mockedExchange).toHaveBeenCalledTimes(1);
    expect(mockedExchange).toHaveBeenCalledWith('https://api.github.com/search/repositories?q=node&client_id=3ff6e9bf539fc9c40c0f&client_secret=85625306aebc569d0a939d712a6da69f76a73a5f');
  });

  it('should renders, be able to type, and activate search button', async () => {
    const apiResponse = Promise.resolve({
      json: () => Promise.resolve(repositories),
      ok: true,
    });

    const mockedExchange = jest.spyOn(global, 'fetch')
      .mockImplementation(() => apiResponse);
    render(<BottomPagination />, { initialState: oneAndTenMillion });

    const pageFive = screen.getAllByText(/<</i);

    expect(pageFive.length).toBe(1);

    userEvent.click(pageFive[0]);

    expect(await screen.findByText(/5/i)).toBeInTheDocument();

    expect(mockedExchange).toHaveBeenCalled();
    expect(mockedExchange).toHaveBeenCalledTimes(1);
    expect(mockedExchange).toHaveBeenCalledWith('https://api.github.com/search/repositories?q=node&client_id=3ff6e9bf539fc9c40c0f&client_secret=85625306aebc569d0a939d712a6da69f76a73a5f');
  });

  it('should renders, be able to type, and activate search button', async () => {
    const apiResponse = Promise.resolve({
      json: () => Promise.resolve(repositories),
      ok: true,
    });

    const mockedExchange = jest.spyOn(global, 'fetch')
      .mockImplementation(() => apiResponse);
    render(<BottomPagination />, { initialState: oneAndTenMillion });

    const pageFive = screen.getAllByText('<');

    expect(pageFive.length).toBe(1);

    userEvent.click(pageFive[0]);

    expect(await screen.findByText(/5/i)).toBeInTheDocument();

    expect(mockedExchange).toHaveBeenCalled();
    expect(mockedExchange).toHaveBeenCalledTimes(1);
    expect(mockedExchange).toHaveBeenCalledWith('https://api.github.com/search/repositories?q=node&client_id=3ff6e9bf539fc9c40c0f&client_secret=85625306aebc569d0a939d712a6da69f76a73a5f');
  });
  it('activate search button', async () => {
    const apiResponse = Promise.resolve({
      json: () => Promise.resolve(repositories),
      ok: true,
    });

    const mockedExchange = jest.spyOn(global, 'fetch')
      .mockImplementation(() => apiResponse);
    render(<BottomPagination />, { initialState: oneAndTenMillion });

    const pageFive = screen.getAllByText('<');

    expect(pageFive.length).toBe(1);

    userEvent.click(pageFive[0]);

    expect(await screen.findByText(/5/i)).toBeInTheDocument();

    expect(mockedExchange).toHaveBeenCalled();
    expect(mockedExchange).toHaveBeenCalledTimes(1);
    expect(mockedExchange).toHaveBeenCalledWith('https://api.github.com/search/repositories?q=node&client_id=3ff6e9bf539fc9c40c0f&client_secret=85625306aebc569d0a939d712a6da69f76a73a5f');
  });
  it('should renders, be able to type, and activate search button', async () => {
    const apiResponse = Promise.resolve({
      json: () => Promise.resolve(repositories),
      ok: true,
    });

    const mockedExchange = jest.spyOn(global, 'fetch')
      .mockImplementation(() => apiResponse);
    render(<BottomPagination />, { initialState: oneAndTenMillion });

    const pageFive = screen.getAllByText('3');

    expect(pageFive.length).toBe(1);

    userEvent.click(pageFive[0]);

    expect(await screen.findByText(/5/i)).toBeInTheDocument();

    expect(mockedExchange).toHaveBeenCalled();
    expect(mockedExchange).toHaveBeenCalledTimes(1);
    expect(mockedExchange).toHaveBeenCalledWith('https://api.github.com/search/repositories?q=node&client_id=3ff6e9bf539fc9c40c0f&client_secret=85625306aebc569d0a939d712a6da69f76a73a5f');
  });

  it('should renders, be able to type, and activate search button', async () => {
    const apiResponse = Promise.resolve({
      json: () => Promise.resolve(repositories),
      ok: true,
    });

    const mockedExchange = jest.spyOn(global, 'fetch')
      .mockImplementation(() => apiResponse);
    render(<BottomPagination />, { initialState: oneAndTenMillion });

    const pageFive = screen.getAllByText('>');

    expect(pageFive.length).toBe(1);

    userEvent.click(pageFive[0]);

    expect(await screen.findByText(/5/i)).toBeInTheDocument();

    expect(mockedExchange).toHaveBeenCalled();
    expect(mockedExchange).toHaveBeenCalledTimes(1);
    expect(mockedExchange).toHaveBeenCalledWith('https://api.github.com/search/repositories?q=node&client_id=3ff6e9bf539fc9c40c0f&client_secret=85625306aebc569d0a939d712a6da69f76a73a5f');
  });

  it('should renders, be able to type, and activate search button', async () => {
    const apiResponse = Promise.resolve({
      json: () => Promise.resolve(repositories),
      ok: true,
    });

    const mockedExchange = jest.spyOn(global, 'fetch')
      .mockImplementation(() => apiResponse);
    render(<BottomPagination />, { initialState: oneAndTenMillion });

    const pageFive = screen.getAllByText(/>>/i);

    expect(pageFive.length).toBe(1);

    userEvent.click(pageFive[0]);

    // expect(await screen.findByText(/5/i)).toBeInTheDocument();

    // expect(mockedExchange).toHaveBeenCalled();
    // expect(mockedExchange).toHaveBeenCalledTimes(1);
    // expect(mockedExchange).toHaveBeenCalledWith('');
  });

  it('should renders, be able to type, and activate search button', async () => {
    const apiResponse = Promise.resolve({
      json: () => Promise.resolve(repositories),
      ok: true,
    });

    const mockedExchange = jest.spyOn(global, 'fetch')
      .mockImplementation(() => apiResponse);
    render(<BottomPagination />, { initialState: oneAndTenMillion });

    const pageFive = screen.getAllByText('>');

    expect(pageFive.length).toBe(1);

    // for (let i = 0; i < 30; i += 1) {
    userEvent.click(pageFive[0]);
    // }

    expect(await screen.findByText(/5/i)).toBeInTheDocument();

    expect(mockedExchange).toHaveBeenCalled();
    expect(mockedExchange).toHaveBeenCalledTimes(1);
    expect(mockedExchange).toHaveBeenCalledWith('https://api.github.com/search/repositories?q=node&client_id=3ff6e9bf539fc9c40c0f&client_secret=85625306aebc569d0a939d712a6da69f76a73a5f');
  });
});

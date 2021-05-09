import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import BottomPagination from './BottomPagination';
import repositories from '../mocks/repositories';
import store from '../store/index';

const PAGINATION_ELEMENTS_COUNT = 9;

beforeAll(() => {
  localStorage.setItem('lastGitHubApiCallUrl', JSON.stringify('https://api.github.com/search/repositories?q=node&client_id=3ff6e9bf539fc9c40c0f&client_secret=85625306aebc569d0a939d712a6da69f76a73a5f'));
});

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

describe('BottomPagination component', () => {
  it('should renders', () => {
    render(
      <Provider store={ store }>
        <BottomPagination />
      </Provider>,
    );
    const pagination = screen.getAllByTestId('bottom-pagination');
    expect(pagination.length).toBe(1);
  });
  it('should renders nine buttons with page options', () => {
    render(
      <Provider store={ store }>
        <BottomPagination />
      </Provider>,
    );
    const pagination = screen.getAllByTestId('bottom-pagination');
    expect(pagination[0].childElementCount).toBe(PAGINATION_ELEMENTS_COUNT);
  });
  it('button for page number one should be active', () => {
    render(
      <Provider store={ store }>
        <BottomPagination />
      </Provider>,
    );
    const pageOne = screen.getAllByTestId('pagination-link-1');
    expect(pageOne.length).toBe(1);
    expect(pageOne[0]).toHaveClass('page-item active');
  });
});

describe('when click on links to pages', () => {
  it('should be able to click on link to page 5', () => {
    const apiResponse = Promise.resolve({
      json: () => Promise.resolve(repositories),
      ok: true,
    });

    const mockedExchange = jest.spyOn(global, 'fetch')
      .mockImplementation(() => apiResponse);

    render(
      <Provider store={ store }>
        <BottomPagination goToPage={ mockedExchange } />
      </Provider>,
    );

    const pageFive = screen.getAllByText(/5/i);
    expect(pageFive.length).toBe(1);
    expect(pageFive[0]).toHaveClass('page-link');

    fireEvent.click(pageFive[0]);
  });

  it('should be able to click on link to page 4', () => {
    render(
      <Provider store={ store }>
        <BottomPagination />
      </Provider>,
    );

    const pageFive = screen.getAllByText(/4/i);

    expect(pageFive.length).toBe(1);
    expect(pageFive[0]).toHaveClass('page-link');

    fireEvent.click(pageFive[0]);
  });

  it('should be able to click on link to page 3', () => {
    render(
      <Provider store={ store }>
        <BottomPagination />
      </Provider>,
    );

    const pageFive = screen.getAllByText(/3/i);

    expect(pageFive.length).toBe(1);
    expect(pageFive[0]).toHaveClass('page-link');

    fireEvent.click(pageFive[0]);
  });

  it('should be able to click on link to page 2', () => {
    render(
      <Provider store={ store }>
        <BottomPagination />
      </Provider>,
    );

    const pageFive = screen.getAllByText(/2/i);

    expect(pageFive.length).toBe(1);
    expect(pageFive[0]).toHaveClass('page-link');

    fireEvent.click(pageFive[0]);
  });
  it('should be able to click on link to page 1', () => {
    render(
      <Provider store={ store }>
        <BottomPagination />
      </Provider>,
    );

    const pageFive = screen.getAllByText(/1/i);

    expect(pageFive.length).toBe(1);
    expect(pageFive[0]).toHaveClass('page-link');

    fireEvent.click(pageFive[0]);
  });

  it('should be able to click on link to next page', () => {
    render(
      <Provider store={ store }>
        <BottomPagination />
      </Provider>,
    );

    const pageFive = screen.getAllByText('>');

    expect(pageFive.length).toBe(1);
    expect(pageFive[0]).toHaveClass('page-link');

    fireEvent.click(pageFive[0]);
  });

  it('should be able to click on link to last page', () => {
    render(
      <Provider store={ store }>
        <BottomPagination />
      </Provider>,
    );

    const pageFive = screen.getAllByText(/>>/i);

    expect(pageFive.length).toBe(1);
    expect(pageFive[0]).toHaveClass('page-link');

    fireEvent.click(pageFive[0]);
  });

  it('should be able to click on link to previous page', () => {
    render(
      <Provider store={ store }>
        <BottomPagination />
      </Provider>,
    );

    const pageFive = screen.getAllByText('<');

    expect(pageFive.length).toBe(1);
    expect(pageFive[0]).toHaveClass('page-link');

    fireEvent.click(pageFive[0]);
  });

  it('should be able to click on link to new page', () => {
    render(
      <Provider store={ store }>
        <BottomPagination />
      </Provider>,
    );

    const pageFive = screen.getAllByText(/<</i);

    expect(pageFive.length).toBe(1);
    expect(pageFive[0]).toHaveClass('page-link');

    fireEvent.click(pageFive[0]);
  });
});

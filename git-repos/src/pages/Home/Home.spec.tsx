import { toast } from 'react-toastify';
import { mocked } from 'ts-jest/utils';

import { fireEvent, render, screen } from '@testing-library/react';

import { Home } from '.';

const mockedHistoryPush = jest.fn();

jest.mock('react-router-dom', () => {
  return {
    useHistory: () => ({
      push: mockedHistoryPush,
    }),
  };
});

jest.mock('react-toastify');

describe('Home page', () => {
  it('should redirect to search page when search repo input has values', () => {
    render(<Home />);

    const input = screen.getByPlaceholderText('Pesquise por um repositório');

    fireEvent.change(input, { target: { value: 'node' } });

    const searchButton = screen.getByTestId('search-button');

    fireEvent.click(searchButton);

    expect(mockedHistoryPush).toHaveBeenCalled();
  });

  it('should not redirect to search page when search repo input is empty', () => {
    const mockedErrorToast = mocked(toast.error);

    render(<Home />);

    fireEvent.click(screen.getByTestId('search-button'));

    expect(mockedHistoryPush).not.toHaveBeenCalled();
    expect(mockedErrorToast).toHaveBeenCalled();
  });
});

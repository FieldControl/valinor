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

describe('Home page', () => {
  it('should push to search page when search repo input has values', () => {
    render(<Home />);

    const input = screen.getByPlaceholderText('Pesquise por um repositório');

    fireEvent.change(input, { target: { value: 'node' } });

    const searchButton = screen.getByTestId('search-button');

    fireEvent.click(searchButton);

    expect(mockedHistoryPush).toHaveBeenCalled();
  });

  it('should not push to search page when search repo input is empty', () => {
    render(<Home />);

    screen.getByTestId('search-button').click();

    expect(mockedHistoryPush).not.toHaveBeenCalled();
  });
});

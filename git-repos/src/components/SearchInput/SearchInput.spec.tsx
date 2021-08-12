import { render, screen } from '@testing-library/react';

import { SearchInput } from '.';

describe('SearchInput component', () => {
  it('should renders correctly', () => {
    render(<SearchInput onChange={jest.fn} onClick={jest.fn} value="" />);

    expect(
      screen.getByPlaceholderText('Pesquise por um repositório')
    ).toBeInTheDocument();
    expect(screen.getByTestId('search-button')).toBeInTheDocument();
  });
});

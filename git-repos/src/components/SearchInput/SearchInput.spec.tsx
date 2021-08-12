import { render } from '@testing-library/react';

import { SearchInput } from '.';

describe('SearchInput component', () => {
  it('renders correctly', () => {
    const { getByPlaceholderText, getByTestId } = render(
      <SearchInput
        onChange={() => console.warn()}
        onClick={() => console.warn()}
        value=""
      />
    );

    expect(
      getByPlaceholderText('Pesquise por um repositório')
    ).toBeInTheDocument();
    expect(getByTestId('search-button')).toBeInTheDocument();
  });
});

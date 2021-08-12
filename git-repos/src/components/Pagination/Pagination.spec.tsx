import { render, screen } from '@testing-library/react';

import { Pagination } from '.';

describe('Pagination component', () => {
  it('should renders correctly', () => {
    render(
      <Pagination
        currentPage={1}
        handlePagination={() => null}
        itemsPerPage={5}
        totalCount={25}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';

import { Header } from '.';

describe('Header component', () => {
  it('should renders correctly', () => {
    render(<Header />);

    expect(screen.getByTestId('theme-toggler-button')).toBeInTheDocument();
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ContextProvider } from '../../../context/data-provider';

import Header from '../header';

const MockHeader = () => {
  return (
    <BrowserRouter>
      <ContextProvider>
        <Header />
      </ContextProvider>
    </BrowserRouter>
  );
};

describe('Header', () => {
  describe('SearchInput', () => {
    test('should render input element', async () => {
      render(<MockHeader />);
      const inputElement = screen.getByPlaceholderText(/Search a repo.../i);
      expect(inputElement).toBeInTheDocument;
    });

    test('should be able to type in input', async () => {
      render(<MockHeader />);
      const inputElement = screen.getByPlaceholderText(/Search a repo.../i);
      fireEvent.change(inputElement, { target: { value: 'javascript' } });
      expect(inputElement.value).toBe('javascript');
    });
  });

  describe('SearchButton', () => {
    test('should render button element', async () => {
      render(<MockHeader />);
      const buttonElement = screen.getByPlaceholderText(/Search/i);
      expect(buttonElement).toBeInTheDocument;
    });
  });
});

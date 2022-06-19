import '@testing-library/jest-dom';
import { render, screen } from "@testing-library/react";
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import App from "../App";
import Main from '../pages/Main';
import renderWithRouter from './renderHistory';

describe("MAIN PAGE", () => {
  it("— A página principal possui uma barra para digitar.", () => {
    render(<BrowserRouter><App /></BrowserRouter>);
    
    const Input = screen.getByPlaceholderText(/Search Github/i);
    expect(Input).toBeInTheDocument();
  });

  it("— É possivel digitar algo na barra de pesquisa.", () => {
    render(<BrowserRouter><App /></BrowserRouter>);
    
    const Input:HTMLInputElement = screen.getByPlaceholderText(/Search Github/i);
    
    userEvent.type(Input,'node');
    expect(Input.value).toBe('node');
  });

  it("— A página principal possui um botão de pesquisar.", () => {
    render(<BrowserRouter><App /></BrowserRouter>);
    
    const SearchButton = screen.getByRole('button', { name: /Search/i });
    expect(SearchButton).toBeInTheDocument();
  });

  it("— Ao clicar no botão de pesquisar sem nenhum input, a página não muda.", () => {
    const { history } = renderWithRouter(<App />);
    
    const SearchButton = screen.getByRole('button', { name: /Search/i });

    userEvent.click(SearchButton);

    const {location: { pathname }} = history;
    expect(pathname).toBe('/');
  });
  
  it("— Ao clicar no botão de pesquisar com algum input, a página é redirecionada.", () => {
    const { history } = renderWithRouter(<Main />);
    
    const Input:HTMLInputElement = screen.getByPlaceholderText(/Search Github/i);
    const SearchButton = screen.getByRole('button', { name: /Search/i });

    userEvent.type(Input,'node');
    userEvent.click(SearchButton);

    let {location: { pathname }} = history;
    
    expect(pathname).toBe('/search/node');
  });
  
  
});
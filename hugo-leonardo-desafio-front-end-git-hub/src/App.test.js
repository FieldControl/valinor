import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import App from './App';
import store from './store/index';

const PAGINATION_ELEMENTS_COUNT = 9;

afterEach(() => {
  cleanup();
});

describe('My App should render', () => {
  it('should renders a navbar with a serach form, group buttons, and a dropdown', () => {
    render(
      <Provider store={ store }>
        <App />
      </Provider>,
    );
    const navbar = screen.getAllByTestId('nav-bar');
    expect(navbar.length).toBe(1);
    expect(navbar[0]).toBeInTheDocument();

    const navbarBtnGroup = screen.getAllByTestId('nav-bar-btn-group');
    expect(navbarBtnGroup.length).toBe(1);
    expect(navbarBtnGroup[0]).toBeInTheDocument();
    expect(navbarBtnGroup[0].firstChild).toBeDisabled();
    expect(navbarBtnGroup[0].lastChild).toBeDisabled();

    const navbarDropDown = screen.getAllByTestId('nav-bar-dropdown');
    expect(navbarDropDown.length).toBe(1);
    expect(navbarDropDown[0]).toBeInTheDocument();
  });
  it('should renders a main content section with repositories results zero', () => {
    render(
      <Provider store={ store }>
        <App />
      </Provider>,
    );
    const text = screen.getAllByText(/results/i);
    expect(text.length).toBe(1);
    expect(text[0]).toBeInTheDocument();
  });
  it('should renders a paginantion component with nine items', () => {
    render(
      <Provider store={ store }>
        <App />
      </Provider>,
    );
    const pagination = screen.getAllByTestId('bottom-pagination');
    expect(pagination.length).toBe(1);
    expect(pagination[0]).toBeInTheDocument();
    expect(pagination[0].childElementCount).toBe(PAGINATION_ELEMENTS_COUNT);
  });
});

describe('when click on link pages', () => {
  it('should call a function to fetch a new page', () => {
    render(
      <Provider store={ store }>
        <App />
      </Provider>,
    );

    const pageFive = screen.getAllByText(/5/i);
    expect(pageFive.length).toBe(1);
    expect(pageFive[0]).toHaveClass('page-link');

    fireEvent.click(pageFive[0]);
  });
});

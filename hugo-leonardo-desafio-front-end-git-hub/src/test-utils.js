// test-utils.js
import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
// import PropTypes from 'prop-types';
// Import your own reducer
// import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import repositories from './store/reducers/repositories';
import issues from './store/reducers/issues';
import pagination from './store/reducers/pagination';

const combinedReducers = combineReducers({ repositories, issues, pagination });

function render(
  ui,
  {
    initialState,
    store = createStore(
      combinedReducers, initialState, applyMiddleware(thunk),
    ),
    ...renderOptions
  } = {},
) {
  function Wrapper({ children }) {
    return <Provider store={ store }>{children}</Provider>;
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// re-export everything
export * from '@testing-library/react';
// override render method
export { render };

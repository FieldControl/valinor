// Store

import thunk from 'redux-thunk';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import repositories from './reducers/repositories';
import issues from './reducers/issues';
import pagination from './reducers/pagination';

const store = createStore(
  combineReducers({ repositories, issues, pagination }),
  composeWithDevTools(applyMiddleware(thunk)),
);

export default store;

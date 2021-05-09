// Reducers

import { ISSUES_RESULT, HANDLE_ERROR } from '../actions/issues';
import { HANDLE_SORT_ISSUES } from '../actions/issuesSort';
import { HANDLE_ISSUES_PAGINATION } from '../actions/pagination';
// import { HANDLE_PAGINATION } from '../actions/pagination';

const initialState = {
  input: '',
  totalCount: 0,
  incompleteResults: false,
  results: [],
  error: '',
};

function issues(state = initialState, action) {
  switch (action.type) {
  case ISSUES_RESULT:
    return {
      ...state,
      incompleteResults: action.data.incomplete_results,
      totalCount: action.data.total_count,
      results: action.data.items,
    };
  case HANDLE_SORT_ISSUES:
    return {
      ...state,
      results: action.data.items,
    };
  case HANDLE_ISSUES_PAGINATION:
    return {
      ...state,
      results: action.data.items,
    };
  case HANDLE_ERROR:
    return {
      ...state,
      error: action.error,
    };
  default:
    return state;
  }
}

export default issues;

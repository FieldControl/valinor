// Reducers

import { SEARCH_INPUT, SEARCH_RESULT, TOGGLE_REPO_OR_ISSUES,
} from '../actions/repositories';
import { HANDLE_SORT } from '../actions/reposiroriesSort';
import { HANDLE_PAGINATION } from '../actions/pagination';

const initialState = {
  input: '',
  totalCount: 0,
  incompleteResults: false,
  results: [],
  sortBy: '',
  isSelected: true,
};

function repositories(state = initialState, action) {
  switch (action.type) {
  case SEARCH_INPUT:
    return {
      ...state,
      input: action.input,
    };
  case SEARCH_RESULT:
    return {
      ...state,
      incompleteResults: action.data.incomplete_results,
      totalCount: action.data.total_count,
      results: action.data.items,
    };
  case HANDLE_SORT:
    return {
      ...state,
      results: action.data.items,
    };
  case TOGGLE_REPO_OR_ISSUES:
    return {
      ...state,
      isSelected: action.isSelected,
    };
  case HANDLE_PAGINATION:
    return {
      ...state,
      results: action.data.items,
    };
  default:
    return state;
  }
}

export default repositories;

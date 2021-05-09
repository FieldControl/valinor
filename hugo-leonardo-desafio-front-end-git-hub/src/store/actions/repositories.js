// Action

import { fetchIssues, handleError } from './issues';
import { searchQuery } from '../../services/apiGitHub';

export const SEARCH_INPUT = 'SEARCH_INPUT';
export const SEARCH_RESULT = 'SEARCH_RESULT';
export const TOGGLE_REPO_OR_ISSUES = 'TOGGLE_REPO_OR_ISSUES';
export const HANDLE_PAGINATION_REPO = 'HANDLE_PAGINATION_REPO';

export const handleSearchInput = (input) => ({
  type: SEARCH_INPUT,
  input,
});

export const handleSearchResult = (data) => ({
  type: SEARCH_RESULT,
  data,
});

const handleIssues = (query, data) => (dispatch) => {
  dispatch(fetchIssues(query));
  dispatch(handleSearchResult(data));
};

export const toggleRepoOrIssues = (bool) => ({
  type: TOGGLE_REPO_OR_ISSUES,
  isSelected: bool,
});

export const fetchSearchQuery = (query) => async (dispatch) => searchQuery(query)
  .then((response) => response.json())
  .then((data) => dispatch(handleIssues(query, data)))
  .catch((error) => dispatch(handleError(error.message)));

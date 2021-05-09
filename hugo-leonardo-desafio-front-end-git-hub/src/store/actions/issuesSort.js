import { mostCommented, leastCommented, getNewest, getOldest,
  issueLeastUp, issueRecentlyUp } from '../../services/apiGitHub';
import { handleError } from './issues';

export const HANDLE_SORT_ISSUES = 'HANDLE_SORT_ISSUES';

export const handleSortIssues = (data) => ({
  type: HANDLE_SORT_ISSUES,
  data,
});

export const sortMostCommented = (query) => async (dispatch) => mostCommented(query)
  .then((response) => response.json())
  .then((data) => dispatch(handleSortIssues(data)))
  .catch((error) => dispatch(handleError(error.message)));

export const sortLeastCommented = (query) => async (dispatch) => leastCommented(query)
  .then((response) => response.json())
  .then((data) => dispatch(handleSortIssues(data)))
  .catch((error) => dispatch(handleError(error.message)));

export const sortNewest = (query) => async (dispatch) => getNewest(query)
  .then((response) => response.json())
  .then((data) => dispatch(handleSortIssues(data)))
  .catch((error) => dispatch(handleError(error.message)));

export const sortOldest = (query) => async (dispatch) => getOldest(query)
  .then((response) => response.json())
  .then((data) => dispatch(handleSortIssues(data)))
  .catch((error) => dispatch(handleError(error.message)));

export const sortRecentlyUpdated = (query) => async (dispatch) => issueLeastUp(query)
  .then((response) => response.json())
  .then((data) => dispatch(handleSortIssues(data)))
  .catch((error) => dispatch(handleError(error.message)));

export const sortLeastRecentUp = (query) => async (dispatch) => issueRecentlyUp(query)
  .then((response) => response.json())
  .then((data) => dispatch(handleSortIssues(data)))
  .catch((error) => dispatch(handleError(error.message)));

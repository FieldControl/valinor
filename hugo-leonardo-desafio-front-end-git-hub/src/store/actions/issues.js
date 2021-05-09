import { getIssues } from '../../services/apiGitHub';

export const ISSUES_RESULT = 'ISSUES_RESULT';
export const HANDLE_ERROR = 'HANDLE_ERROR';

export const handleIssues = (data) => ({
  type: ISSUES_RESULT,
  data,
});

export const handleError = (error) => ({
  type: HANDLE_ERROR,
  error,
});

export const fetchIssues = (query) => async (dispatch) => getIssues(query)
  .then((response) => response.json())
  .then((data) => dispatch(handleIssues(data)))
  .catch((error) => handleError(error.message));

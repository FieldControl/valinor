import { mostStars, fewestStars, mostForks, fewestForks, repoRecentlyUp,
  repoLeastUp } from '../../services/apiGitHub';
import { handleError } from './issues';

export const HANDLE_SORT = 'HANDLE_SORT';

export const handleSort = (data) => ({
  type: HANDLE_SORT,
  data,
});

export const sortMostStars = (query) => async (dispatch) => mostStars(query)
  .then((response) => response.json())
  .then((data) => dispatch(handleSort(data)))
  .catch((error) => dispatch(handleError(error.message)));

export const sortFewestStars = (query) => async (dispatch) => fewestStars(query)
  .then((response) => response.json())
  .then((data) => dispatch(handleSort(data)))
  .catch((error) => dispatch(handleError(error.message)));

export const sortMostForks = (query) => async (dispatch) => mostForks(query)
  .then((response) => response.json())
  .then((data) => dispatch(handleSort(data)))
  .catch((error) => dispatch(handleError(error.message)));

export const sortFewestForks = (query) => async (dispatch) => fewestForks(query)
  .then((response) => response.json())
  .then((data) => dispatch(handleSort(data)))
  .catch((error) => dispatch(handleError(error.message)));

export const sortRecentlyUpdated = (query) => async (dispatch) => repoRecentlyUp(query)
  .then((response) => response.json())
  .then((data) => dispatch(handleSort(data)))
  .catch((error) => dispatch(handleError(error.message)));

export const sortLeastRecentlyUpdated = (query) => async (dispatch) => repoLeastUp(query)
  .then((response) => response.json())
  .then((data) => dispatch(handleSort(data)))
  .catch((error) => dispatch(handleError(error.message)));

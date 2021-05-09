import { pagination } from '../../services/apiGitHub';
import { handleError } from './issues';

export const HANDLE_PAGINATION = 'HANDLE_PAGINATION';
export const HANDLE_ISSUES_PAGINATION = 'HANDLE_ISSUES_PAGINATION';
export const UPDATE_PAGINATION = 'UPDATE_PAGINATION';
export const SET_PAGE_COUNT = 'SET_PAGE_COUNT';
export const BASE_PAGINATION_COUNT = 3;

export const handlePagination = (data) => ({
  type: HANDLE_PAGINATION,
  data,
});

export const setPageCount = (newPage, pageCount) => ({
  type: SET_PAGE_COUNT,
  baseCount: pageCount,
  query: newPage,
});

const handleIssuesPagination = (data) => ({
  type: HANDLE_ISSUES_PAGINATION,
  data,
});

export const updatePagination = (newPage, data) => (dispatch) => {
  const { number } = data.items[0];

  if (number) {
    dispatch(handleIssuesPagination(data));
  }
  if (!number) {
    dispatch(handlePagination(data));
  }
  const pageCount = parseInt(newPage.match(/\d+/)[0], 10);
  if (pageCount < BASE_PAGINATION_COUNT) {
    return dispatch(setPageCount(newPage, BASE_PAGINATION_COUNT));
  }
  dispatch(setPageCount(newPage, pageCount));
};

// eslint-disable-next-line max-len
export const fetchNewPage = (newPage, isSelected) => async (dispatch) => pagination(newPage, isSelected)
  .then((response) => response.json())
  .then((data) => dispatch(updatePagination(newPage, data)))
  .catch((error) => dispatch(handleError(error.message)));

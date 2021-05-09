// Reducers

// import { ISSUES_RESULT } from '../actions/issues';
// import { HANDLE_SORT_ISSUES } from '../actions/issuesSort';
import { SET_PAGE_COUNT } from '../actions/pagination';

const initialState = {
  query: 'page=1',
  baseCount: 3,
};

function pagination(state = initialState, action) {
  switch (action.type) {
  case SET_PAGE_COUNT:
    return {
      ...state,
      query: action.query,
      baseCount: parseInt(action.baseCount, 10),
    };
  // case HANDLE_SORT_ISSUES:
  //   return {
  //     ...state,
  //     results: action.data.items,
  //   };
  default:
    return state;
  }
}

export default pagination;

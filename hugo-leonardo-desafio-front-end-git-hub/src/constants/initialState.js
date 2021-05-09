import issues from '../mocks/issues';
import repositories from '../mocks/repositories';

export const initialState = {
  repositories: {
    input: 'node',
    totalCount: 1084045,
    incompleteResults: false,
    sortBy: '',
    isSelected: false,
    results: repositories.items,
  },
  issues: {
    input: '',
    totalCount: 14474047,
    incompleteResults: false,
    results: issues.items,
    error: '',
  },
  pagination: {
    query: 'page=1',
    baseCount: 3,
  },
};

export const initialStateSelected = {
  repositories: {
    input: 'node',
    totalCount: 1084045,
    incompleteResults: false,
    sortBy: '',
    isSelected: true,
    results: repositories.items,
  },
  issues: {
    input: '',
    totalCount: 14474047,
    incompleteResults: false,
    results: issues.items,
    error: '',
  },
  pagination: {
    query: 'page=1',
    baseCount: 3,
  },
};

export const initialStateError = {
  repositories: {
    input: 'node',
    totalCount: 1084045,
    incompleteResults: false,
    sortBy: '',
    isSelected: true,
    results: repositories.items,
  },
  issues: {
    input: '',
    totalCount: 14474047,
    incompleteResults: false,
    results: issues.items,
    error: 'Error',
  },
  pagination: {
    query: 'page=1',
    baseCount: 3,
  },
};

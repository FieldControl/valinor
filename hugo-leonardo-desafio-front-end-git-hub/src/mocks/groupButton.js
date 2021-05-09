import repositories from './repositories';
import issues from './issues';

export const oneAndTenMillion = {
  repositories: {
    input: '',
    totalCount: 1084045,
    incompleteResults: false,
    sortBy: '',
    isSelected: true,
    results: repositories,
  },
  issues: {
    input: '',
    totalCount: 14474047,
    incompleteResults: false,
    results: issues,
  },
  pagination: {
    query: 'page=1',
    baseCount: 3,
  },
};

export const hundredAndTenThousand = {
  repositories: {
    input: 'node',
    totalCount: 10840,
    incompleteResults: false,
    sortBy: '',
    isSelected: true,
    results: repositories,
  },
  issues: {
    input: '',
    totalCount: 144740,
    incompleteResults: false,
    results: issues,
  },
  pagination: {
    query: 'page=1',
    baseCount: 3,
  },
};

export const hundredAndThousand = {
  repositories: {
    input: 'node',
    totalCount: 500,
    incompleteResults: false,
    sortBy: '',
    isSelected: true,
    results: repositories,
  },
  issues: {
    input: '',
    totalCount: 1447,
    incompleteResults: false,
    results: issues,
  },
  pagination: {
    query: 'page=1',
    baseCount: 3,
  },
};

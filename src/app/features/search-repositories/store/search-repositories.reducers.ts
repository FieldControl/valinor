import {
  createFeatureSelector,
  createReducer,
  createSelector,
  on,
} from '@ngrx/store';

import { ISearchRepositoriesState } from './data/search-repositories-state.interface';
import * as SearchProfilesActions from './search-repositories.actions';

export const initialSearchRepositoriesState: ISearchRepositoriesState = {
  repositories: [],
  loading: false,
  error: null,
  lastSearch: '',
  paginator: 0,
  totalItems: 0,
};

export const searchRepositoriesReducer = createReducer(
  initialSearchRepositoriesState,
  on(SearchProfilesActions.getRepositories, (state, { searchTerm, page }) => ({
    ...state,
    loading: true,
    error: null,
    lastSearch: searchTerm,
    paginator: page,
  })),
  on(SearchProfilesActions.getRepositoriesSuccess, (state, { payload }) => ({
    ...state,
    repositories: payload.items,
    totalItems: payload.total_count,
    loading: false,
    error: null,
  })),
  on(SearchProfilesActions.getRepositoriesFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  }))
);

export const selectSearchRepositoriesState =
  createFeatureSelector<ISearchRepositoriesState>('searchProfiles');

export const selectRepositoriesData = createSelector(
  selectSearchRepositoriesState,
  (state: ISearchRepositoriesState) => state.repositories
);

export const selectLastSearch = createSelector(
  selectSearchRepositoriesState,
  (state: ISearchRepositoriesState) => state.lastSearch
);

export const selectPaginator = createSelector(
  selectSearchRepositoriesState,
  (state: ISearchRepositoriesState) => state.paginator
);

export const selectTotalItems = createSelector(
  selectSearchRepositoriesState,
  (state: ISearchRepositoriesState) => state.totalItems
);

export const selectLoading = createSelector(
  selectSearchRepositoriesState,
  (state: ISearchRepositoriesState) => state.loading
);

export const selectError = createSelector(
  selectSearchRepositoriesState,
  (state: ISearchRepositoriesState) => state.error
);

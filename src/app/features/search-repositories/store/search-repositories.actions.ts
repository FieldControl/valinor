import { createAction, props } from '@ngrx/store';
import { IGitHubSearch } from '../interfaces/github.interface';

export const getRepositories = createAction(
  '[List Profiles] Get Repositories',
  props<{ searchTerm: string; page: number }>()
);

export const getRepositoriesSuccess = createAction(
  '[List Repositories] Get Repositories Success',
  props<{ payload: IGitHubSearch }>()
);
export const getRepositoriesFailure = createAction(
  '[List Repositories] Get Repositories Failure',
  props<{ error: any }>()
);

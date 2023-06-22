import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';

import { SearchRepositoriesService } from '../services/search-repositories.service';
import { ISearchRepositoriesState } from './data/search-repositories-state.interface';
import * as SearchRepositoriesActions from './search-repositories.actions';

@Injectable()
export class SearchProfilesEffects {
  getRepositories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SearchRepositoriesActions.getRepositories),
      mergeMap((action) => {
        return this.service
          .getRepositories(action.searchTerm, action.page)
          .pipe(
            map((repositories) =>
              SearchRepositoriesActions.getRepositoriesSuccess({
                payload: repositories,
              })
            ),
            catchError((error) =>
              of(
                SearchRepositoriesActions.getRepositoriesFailure({
                  error: error.message,
                })
              )
            )
          );
      })
    )
  );

  getRepositoriesSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SearchRepositoriesActions.getRepositoriesSuccess),
        tap(() => this.router.navigate(['/search-results']))
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private service: SearchRepositoriesService,
    private router: Router,
    private store: Store<{ searchProfiles: ISearchRepositoriesState }>
  ) {}
}

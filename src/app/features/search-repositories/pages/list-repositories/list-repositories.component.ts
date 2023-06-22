import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';

import { IGitHubRepository } from '../../interfaces/github.interface';
import { SearchProfilesModule } from '../../search-repositories.module';
import { ISearchRepositoriesState } from '../../store/data/search-repositories-state.interface';
import * as SearchProfilesActions from '../../store/search-repositories.actions';
import {
  selectError,
  selectLastSearch,
  selectLoading,
  selectPaginator,
  selectRepositoriesData,
  selectTotalItems,
} from '../../store/search-repositories.reducers';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    SearchProfilesModule,
    MatGridListModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './list-repositories.component.html',
  styleUrls: ['./list-repositories.component.scss'],
})
export class ListRepositoriesComponent implements OnInit {
  currentSearch: string;
  paginator: number;
  totalItems: number;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;
  repositoriesData$: Observable<IGitHubRepository[]>;

  currentSearchSubscription: Subscription | undefined;
  paginatorSubscription: Subscription | undefined;
  totalItemsSubscription: Subscription | undefined;

  constructor(private store: Store<ISearchRepositoriesState>) {
    this.isLoading$ = this.store.pipe(select(selectLoading));
    this.error$ = this.store.pipe(select(selectError));
    this.repositoriesData$ = this.store.pipe(select(selectRepositoriesData));
    this.currentSearchSubscription = this.store
      .pipe(select(selectLastSearch))
      .subscribe((search: string) => {
        this.currentSearch = search;
      });

    this.paginatorSubscription = this.store
      .pipe(select(selectPaginator))
      .subscribe((page: number) => {
        this.paginator = page;
      });

    this.totalItemsSubscription = this.store
      .pipe(select(selectTotalItems))
      .subscribe((total: number) => {
        this.totalItems = total;
      });
  }

  ngOnInit() {}

  onSearch(searchFor: string) {
    this.store.dispatch(
      SearchProfilesActions.getRepositories({ searchTerm: searchFor, page: 0 })
    );
  }

  ngOnDestroy(): void {
    if (this.currentSearchSubscription) {
      this.currentSearchSubscription.unsubscribe();
    }
    if (this.paginatorSubscription) {
      this.paginatorSubscription.unsubscribe();
    }
  }

  onPageChange(newPage: number) {
    console.log(newPage);
    this.store.dispatch(
      SearchProfilesActions.getRepositories({
        searchTerm: this.currentSearch,
        page: newPage,
      })
    );
  }
}

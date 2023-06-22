import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { SearchProfilesModule } from '../../search-repositories.module';
import * as SearchProfilesActions from '../../store/search-repositories.actions';

@Component({
  standalone: true,
  imports: [CommonModule, SearchProfilesModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  repositoriesData$: Observable<any>;
  loading$: Observable<boolean>;
  error$: Observable<any>;

  octocatBase64: string = `base64,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`;

  constructor(private store: Store) {}

  ngOnInit(): void {}

  onSearch(searchFor: string) {
    this.store.dispatch(
      SearchProfilesActions.getRepositories({ searchTerm: searchFor, page: 1 })
    );
  }
}

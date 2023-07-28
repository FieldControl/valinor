import { Component, HostListener } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { GitHubResponse } from '@core/interfaces/search.interface';
import { GitHubService } from '@core/services/github.services';
import { Observable, tap } from 'rxjs';

@Component({
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent {
  data$!: Observable<GitHubResponse>;
  showLoader = false;
  searchText = new FormControl('');
  pageIndex = 0;
  pageSize = 5;

  constructor(
    private github: GitHubService,
    private activeRoute: ActivatedRoute
  ) {}

  @HostListener('document:keydown.enter', ['$event'])
  onSearch() {
    this.pageSize = 10;
    this.pageIndex = 0;
    this.performSearch();
  }

  performSearch(): void {
    if (!this.searchText.value && this.searchText.value === '') return;
    this.showLoader = true;
    this.activeRoute.queryParams
      .pipe(
        tap(() => {
          this.data$ = this.github
            .getInfo(this.searchText.value ?? '', this.pageIndex, this.pageSize)
            .pipe(
              tap(() => {
                this.showLoader = false;
              })
            );
        })
      )
      .subscribe();
  }

  handlePageEvent(e: PageEvent) {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.performSearch();
  }
}

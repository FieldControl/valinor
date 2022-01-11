import { Component } from '@angular/core';
import { PaginationInstance } from 'ngx-pagination';
import { GithubRepository } from './models/Repository.model';
import { SearchService } from './services/search/search.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent {
  query: string = '';
  repositories: GithubRepository[] = [];

  config: PaginationInstance = {
    itemsPerPage: 30,
    currentPage: 1,
    totalItems: 0,
  };

  constructor(private searchService: SearchService) {}

  ngOnInit() {
    this.searchService.searchQueryObserver.subscribe(response => {
      if (this.query !== response) {
        this.query = response;
        this.config.currentPage = 1;
      }
    });

    this.searchService.dataChangeObserver.subscribe(response => {
        this.config.totalItems = response.total_count;
        this.repositories = response.items;
      }
    );
  }

}

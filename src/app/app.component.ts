
import { Component, Input } from '@angular/core';
import { GithubServiceApi } from './services/github.service';
import PaginationModel from './models/pagination';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent {
  data: any;
  pageItemsLength: number = 100;

  constructor(private apiService: GithubServiceApi) {}

  ngOnInit(): void {}

  fetchRepositories(paginationModel: PaginationModel) {
    this.apiService
      .get('search/repositories', { q: paginationModel?.searchText, page: paginationModel?.page, per_page: paginationModel?.itemsPerPage })
      .subscribe((data) => {
          this.data = data.items;
          this.pageItemsLength = data.total_count;
      });
  }

  fetchPaginationRepositories(paginationModel: PaginationModel) {
    this.fetchRepositories(paginationModel);
  }
}
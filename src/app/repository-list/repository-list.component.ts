import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { SearchResultItem } from '../_models/search-result-item';
import { RepositoryService } from '../_services/repository/repository.service';

@Component({
  selector: 'app-repository-list',
  templateUrl: './repository-list.component.html',
  styleUrls: ['./repository-list.component.css']
})

export class RepositoryListComponent implements OnChanges {
  searchResultList: SearchResultItem[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  hasPreviousPage: boolean = false;
  hasNextPage: boolean = false;

  @Input() searchText = '';

  constructor(private repositoryService: RepositoryService) { };

  ngOnChanges() {
    if (this.searchText.length !== 0) {
      this.updateRepositoryList();
    }
    else {
      this.searchResultList = [];
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateRepositoryList();
    }
  }

  nextPage() {
    this.currentPage++;
    this.updateRepositoryList();
  }

  updateRepositoryList() {
    this.repositoryService.getRepositories(this.searchText, this.currentPage)
      .subscribe((response) => {
        this.searchResultList = response.items;
        let maxNumberOfPages = response.total_count / 10;
        if (maxNumberOfPages > 100) {
          maxNumberOfPages = 100;
        }

        this.hasPreviousPage = this.currentPage > 1;
        this.hasNextPage = this.currentPage < maxNumberOfPages;
      });
  }
}

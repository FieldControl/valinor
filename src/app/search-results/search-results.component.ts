import { Component, OnInit, OnDestroy } from '@angular/core';
import { GithubService } from '../github.service';
import { Subscription } from 'rxjs';
import { Repository } from '../models/repository.model';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  repositories: Repository[] = [];
  currentPage = 1;
  totalPages = 0;
  searchQuery = '';
  isSearched = false;
  storedRepositories: any[] = [];
  storedTotalPages = 0;
  isError = false;
  private searchSubscription: Subscription | undefined;

  constructor(private githubService: GithubService) { }

  ngOnInit() {
    
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  loadRepositories() {
      this.isSearched = true;
      this.searchSubscription = this.githubService.searchRepositories(this.searchQuery, this.currentPage)
        .subscribe((response) => {
          this.repositories = response.items;
          this.totalPages = Math.ceil(response.total_count / response.items.length);
        });
    
  }

  paginateRepositories() {
    const perPage = 20; // Número de repositórios exibidos por vez
    const startIndex = (this.currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    this.repositories = this.storedRepositories.slice(startIndex, endIndex);
  }

  searchRepositories() {
    if (this.searchQuery.trim() !== '') {
    this.currentPage = 1;
    this.loadRepositories();
    this.isError= false
    }else{
      this.isError= true
    }
  }

  loadMore() {
    this.currentPage++;
    if (this.isSearched) {
      this.loadRepositories();
    } else {
      this.paginateRepositories();
    }
  }

  isFirstPage(): boolean {
    return this.currentPage === 1;
  }

  isLastPage(): boolean {
    return this.currentPage === this.totalPages;
  }

  goToPreviousPage() {
    if (!this.isFirstPage()) {
      this.currentPage--;
      if (this.isSearched) {
        this.loadRepositories();
      } else {
        this.paginateRepositories();
      }
    }
  }

  goToNextPage() {
    if (!this.isLastPage()) {
      this.currentPage++;
      if (this.isSearched) {
        this.loadRepositories();
      } else {
        this.paginateRepositories();
      }
    }
  }
}

import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css'],
})
export class SearchBarComponent {
  constructor(private http: HttpClient) {}

  searchQuery: string = '';
  searchedQuery: string = '';
  searchResults: boolean = false;
  repositories: any[] = [];
  currentPage: number = 0;
  totalPages: number = 0;
  newSearch: boolean = false;

  onSearchClick() {
    if (this.searchQuery.trim() !== '') {
      this.searchRepositories(this.searchQuery);
    }
  }

  searchRepositories(query: string, page: number = 1, changePage: boolean = false,  perPage: number = 10) {
    const apiUrl = `https://api.github.com/search/repositories?q=${query}&page=${page}&per_page=${perPage}`;

    this.http.get(apiUrl).subscribe((response: any) => {
      this.repositories = response.items;
      this.currentPage = page;
      this.totalPages = Math.ceil(response.total_count / perPage);
      this.searchResults = true;
      this.searchedQuery = changePage ? this.searchedQuery : this.searchQuery;
      this.searchQuery = '';
      this.newSearch = !this.newSearch;
    });
  }

  onPageChange(page: number) {
    this.searchRepositories(this.searchedQuery, page, true);
  }

  onBackClick() {
    this.searchQuery = '';
    this.repositories = [];
    this.searchResults = false;
  }
}

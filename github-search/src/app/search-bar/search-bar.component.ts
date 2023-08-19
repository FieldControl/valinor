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
  searchResults: boolean = false;
  repositories: any[] = [];
  currentPage: number = 0;
  totalPages: number = 0;

  onSearchClick() {
    if (this.searchQuery.trim() !== '') {
      this.searchRepositories(this.searchQuery);
      this.searchResults = true;
    }
  }

  searchRepositories(query: string, page: number = 1, perPage: number = 10) {
    const apiUrl = `https://api.github.com/search/repositories?q=${query}&page=${page}&per_page=${perPage}`;

    this.http.get(apiUrl).subscribe((response: any) => {
      this.repositories = response.items; // Armazenar os repositórios na variável
      this.currentPage = page; // Armazenar a página atual
      this.totalPages = Math.ceil(response.total_count / perPage); // Calcular o número total de páginas
    });
  }

  onPageChange(page: number) {
    this.searchRepositories(this.searchQuery, page);
  }

  onBackClick() {
    this.searchQuery = '';
    this.repositories = [];
    this.searchResults = false;
  }
}

import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent {
  constructor(private http: HttpClient) { }

  searchQuery: string = '';
  searchResults: boolean = false;
  repositories: any[] = [];

  async onSearchClick() {
    if (this.searchQuery.trim() !== '') {
      await this.searchRepositories(this.searchQuery);
      this.searchResults = true;
    }
  }

  async searchRepositories(query: string) {
    const apiUrl = `https://api.github.com/search/repositories?q=${query}`;

    this.http.get(apiUrl).subscribe((response: any) => {
      this.repositories = response.items;
    });
  }

  onBackClick() {
    this.searchQuery = '';
    this.repositories = [];
    this.searchResults = false;
  }
}

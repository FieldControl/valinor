
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-repository-search',
  templateUrl: './repository-search.component.html',
  styleUrls: ['./repository-search.component.css']
})
export class RepositorySearchComponent implements OnInit {
  query: string = '';
  repositories: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if (this.query) {
      this.searchRepositories();
    }
  }

  searchRepositories = () => {
    const apiUrl = 'https://api.github.com/search/repositories?q=${this.query}&page=${this.currentPage}&per_page=${this.itemsPerPage}';

    const headers = new HttpHeaders({
      'User-Agent': 'Angular App'
    });

    this.http.get(apiUrl, { headers }).subscribe((response: any) => {
      this.repositories = response.items;
      this.totalItems = response.total_count;
    });
  };

  previousPage = () => {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.searchRepositories();
    }
  };

  nextPage = () => {
    if (this.currentPage * this.itemsPerPage < this.totalItems) {
      this.currentPage++;
      this.searchRepositories();
    }
  };

  getDisplayedPages(): (number | string)[] {
    const totalPages = this.getTotalPages();
    const displayedPages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        displayedPages.push(i);
      }
    } else {
      const startPage = Math.max(this.currentPage - 3, 1);
      const endPage = Math.min(this.currentPage + 3, totalPages);

      for (let i = startPage; i <= endPage; i++) {
        displayedPages.push(i);
      }

      if (startPage > 1) {
        displayedPages.unshift('...');
      }
      if (endPage < totalPages) {
        displayedPages.push('...');
      }
    }

    return displayedPages;
  }

  // Função para calcular o total de páginas
  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  goToPage(page: number | string): void {
    if (typeof page === 'number') {
      if (page >= 1 && page <= this.getTotalPages()) {
        this.currentPage = page;
        this.searchRepositories();
      }
    }
  }
}
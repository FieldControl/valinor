import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Repository {
  name: string;
  html_url: string;
  description: string;
  stargazers_count: number;
  watchers_count: number;
  open_issues_count: number;
}

@Component({
  selector: 'app-repository-search',
  templateUrl: './repository-search.component.html',
  styleUrls: ['./repository-search.component.css'],
})
export class RepositorySearchComponent implements OnInit {
  currentPage = 1;
  totalCount = 0;
  nameRepository = '';
  repositories: Repository[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.searchRepositories();
  }

  async searchRepositories() {
    const api = `https://api.github.com/search/repositories?q=${this.nameRepository}&page=${this.currentPage}&per_page=10`;

    try {
      const data = await this.http.get(api).toPromise() as any;

      if (!data.total_count) {
        throw new Error(`Repositório não encontrado: ${this.nameRepository}`);
      }

      this.totalCount = data.total_count;
      this.repositories = data.items.map((item: any) => ({
        name: item.name,
        html_url: item.html_url,
        description: item.description,
        stargazers_count: item.stargazers_count,
        watchers_count: item.watchers_count,
        open_issues_count: item.open_issues_count,
      }));
    } catch (err) {
      console.error(err);
      this.repositories = [];
      this.totalCount = 0;
    }
  }

  onPageChange(pageNumber: number) {
    this.currentPage = pageNumber;
    this.searchRepositories();
  }
}

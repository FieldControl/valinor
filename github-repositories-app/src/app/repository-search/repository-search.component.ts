import { Component, OnInit } from '@angular/core';
import { GithubService } from '../github.service';

@Component({
  selector: 'app-repository-search',
  templateUrl: './repository-search.component.html',
  styleUrls: ['./repository-search.component.css']
})
export class RepositorySearchComponent implements OnInit {
  query = '';
  page = 1;
  repositories: any[] = [];

  constructor(private githubService: GithubService) { }

  ngOnInit(): void {
  }

  searchRepositories(): void {
    this.githubService.searchRepositories(this.query, this.page)
      .subscribe((response: any) => {
        this.repositories = response.items;
      });
  }

  nextPage(): void {
    this.page++;
    this.searchRepositories();
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page--;
      this.searchRepositories();
    }
  }
}

import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GithubService } from 'src/app/services/github/github.service';
import { RepositoriesResponse } from 'src/interfaces/RepositoriesResponse';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
})
export class ResultsComponent {
  repositories: RepositoriesResponse['items'] = [];
  totalCount = 0;
  currentPage = 1;
  isLoading = false;
  searchTerm = '';
  isError = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private githubService: GithubService
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(({ searchTerm }) => {
      this.searchTerm = searchTerm;
    });

    this.getData();
  }

  getData() {
    this.isLoading = true;

    this.githubService.getRepositories(this.searchTerm).subscribe({
      next: ({ items }) => {
        this.repositories = items;
        this.totalCount = items.length;
        this.isLoading = false;
      },
      error: () => {
        this.isError = true;
        this.isLoading = false;
      },
    });
  }
}

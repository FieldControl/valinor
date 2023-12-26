import { Component, HostListener, OnInit } from '@angular/core';
import { GithubService } from '../../services/github/github.service';
import { SearchService } from '../../services/search/search.service';
import { Repo } from '../repo-card/repo-card.component';

@Component({
  selector: 'app-repo',
  templateUrl: './repo.component.html',
  styleUrl: './repo.component.css'
})
export class RepoComponent implements OnInit{
  repos: Repo[] = [];
  currentPage = 1;
  itemsPerPage = 12;
  totalItems = 0;
  loading = false;
  query = '';
  error: string | null = null;

  constructor(
    private githubService: GithubService,
    private searchService: SearchService
    ) { }

  ngOnInit(): void {
    this.searchService.currentSearchQuery.subscribe((query) => {
      this.query = query;
      this.currentPage = 1;
      this.loadRepos();
    });

    this.loadRepos();
  }

  loadRepos(): void {
    this.loading = true;
    this.error = null;

    this.githubService.getRepos(
      this.query,
      this.currentPage,
      this.itemsPerPage
    ).subscribe((data: any) => {
      this.repos = data.items;
      this.totalItems = data.total_count;
      this.loading = false;
    },
    (error) => {
      this.error = 'An error occurred while fetching repositories.';
      this.loading = false;
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadRepos();
  }
}

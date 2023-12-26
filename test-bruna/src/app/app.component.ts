import { Component } from '@angular/core';
import { GithubService } from './services/github/github.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'test-bruna';

  repos: any[] = [];
  currentPage = 1;
  itemsPerPage = 9;
  totalItems = 0;
  loading = false;
  query = 'brunap';

  constructor(private githubService: GithubService) { }


  loadRepos(): void {
    this.loading = true;
    this.githubService.getRepos(
      this.query,
      this.currentPage,
      this.itemsPerPage
    ).subscribe((data: any) => {
      this.repos = data.items;
      this.totalItems = data.total_count;
      this.loading = false;
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadRepos();
  }
}

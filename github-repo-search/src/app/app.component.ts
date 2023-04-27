import { Component } from '@angular/core';
import { Repositories } from './interfaces/repositories';
import { GithubRepositoriesService } from './services/repositoriesService/github-repositories.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  repositories!: Repositories[];
  search = '';
  currentPage = 1;

  constructor(private githubRepositoriesService: GithubRepositoriesService) {}

  async ngOnInit(): Promise<void> {
    try {
      this.githubRepositoriesService
        .getRepositories(1)
        .subscribe((response: any) => {
          this.repositories = response.items;
        });
    } catch (error) {
      this.repositories = [];
    }
  }

  onNewRepositories(event: any) {
    this.repositories = event.items;
  }

  onSearchChanged(newSearchValue: string) {
    this.search = newSearchValue;
    this.githubRepositoriesService
      .searchRepository(newSearchValue)
      .subscribe((response: any) => {
        this.repositories = response.items;
      });
  }
}

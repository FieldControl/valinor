import { Component } from '@angular/core';
import { GithubApiService } from '../github-api.service';

@Component({
  selector: 'app-search-items',
  templateUrl: './search-items.component.html',
  styleUrls: ['./search-items.component.css']
})
export class SearchItemsComponent {
  searchQuery: string = '';
  repositories: any[] = [];

  constructor(private githubApiService: GithubApiService) { }

  search() {
    this.githubApiService.searchRepositories(this.searchQuery)
      .subscribe(
        (repositories: any[]) => {
          this.repositories = repositories;
        },
        (error) => {
          console.log('Error fetching repositories:', error);
        }
      );
  }
}
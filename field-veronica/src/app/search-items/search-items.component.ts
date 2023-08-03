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
  currentPage: number = 1;
  itemsPerPage: number = 15;

  constructor(private githubApiService: GithubApiService) { }

  search() {
    this.githubApiService.searchRepositories(this.searchQuery)
      .subscribe(
        (repositories: any[]) => {
          this.repositories = repositories;
          this.currentPage = 1; 
        },
        (error) => {
          console.log('Error fetching repositories:', error);
        }
      );
  }
  
  nextPage() {
    this.currentPage++;
  }

  prevPage() {
    this.currentPage--;
  }

  getPaginatedRepositories() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.repositories.slice(startIndex, endIndex);
  }

  getTotalPages() {
  return Math.ceil(this.repositories.length / this.itemsPerPage);
}
}
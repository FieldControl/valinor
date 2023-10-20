import { Component, OnChanges } from '@angular/core';
import { Item } from './model/github.model';
import { GithubService } from './service/github.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'search_github';

  q: string = '';
  sortAndOrder: string = 'best-match';
  prevnumberOfRepositories: number = 0;
  numberOfRepositories: number = 0;
  limit: number = 15;
  page: number = 1;
  pages: number[] = [1];
  repositories: Item[] = [];
  lastPage: number = 0;


  constructor(private githubService: GithubService) {}

  findRepositories() {
    this.githubService.findRepositories(this.q, this.sortAndOrder, this.page).subscribe(data => {
      this.repositories = data.items;
      this.numberOfRepositories = data.total_count;
    });
  }

  ngDoCheck(): void {    
    if(this.prevnumberOfRepositories !== this.numberOfRepositories) {
      this.prevnumberOfRepositories = this.numberOfRepositories;
      this.pages = this.githubService.createPagesArray(this.numberOfRepositories, this.limit);
    }
  }

  mainSearch() {
    this.page = 1;
    this.findRepositories();
  }

  goToNextPage() {
    this.page += 1;
    this.findRepositories();
  }

  goToPreviousPage() {
    this.page -= 1;
    this.findRepositories();
  }
}

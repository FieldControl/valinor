import { Component } from '@angular/core';
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
  perPage: number = 15;
  page: number = 1;
  prevPage: number = 1;
  pages: number[] = [1];
  repositories: Item[] = [];
  hidden: boolean = true;
  filtersDesable: boolean = true;
  nextDesable: boolean = false;
  prevDesable: boolean = false;


  constructor(private githubService: GithubService) {}

  findRepositories() {
    this.githubService.findRepositories(this.q, this.sortAndOrder, this.page, this.perPage).subscribe(data => {
      this.repositories = data.items;
      this.numberOfRepositories = data.total_count;
    });
  }

  ngDoCheck(): void {    
    if(this.prevnumberOfRepositories !== this.numberOfRepositories) {
      this.prevnumberOfRepositories = this.numberOfRepositories;
      this.pages = this.githubService.createPagesArray(this.numberOfRepositories, this.perPage);
    }
    if(!this.q.length) {
      this.filtersDesable = true;
    } else {
      this.filtersDesable = false;
    }

    if(this.prevPage !== this.page) {
      this.nextDesable = this.githubService.nextIsPossible(this.page, this.pages.length);
      this.prevDesable = this.githubService.prevIsPossible(this.page); 
      this.prevPage = this.page;
    }
  }

  mainSearch() {
    this.page = 1;
    this.hidden = false;
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

  selectPage() {
    this.page = Number(this.page);
    this.findRepositories();
  }

  changePerPage() {
    this.pages = this.githubService.createPagesArray(this.numberOfRepositories, this.perPage);
    this.findRepositories();
  }
}

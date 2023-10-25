import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Item } from 'src/app/model/github.model';
import { GithubService } from 'src/app/service/github.service';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  imports: [FormsModule, HttpClientModule, CommonModule, CardComponent],
  standalone: true
})
export class PageComponent {
  title = 'search_github';

  q: string = '';
  perPage: number = 15;
  sortAndOrder: string = 'best-match';
  page: number = 1;
  prevPage: number = 1;
  pages: number[] = [1];
  nextDesable: boolean = false;
  prevDesable: boolean = true;
  navHidden: boolean = true;
  prevnumberOfRepositories: number = 0;
  numberOfRepositories: number = 0;
  repositories: Item[] = [];
  filtersDesable: boolean = true;


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
      this.navHidden = false;
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

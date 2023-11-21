import { Component, NgModule, OnInit } from '@angular/core';
import { Repository } from 'src/app/models/repository';
import { GithubService } from 'src/app/services/github.service';
import { emojify } from 'node-emoji';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})

export class SearchComponent {



  constructor(private githubService: GithubService) { }

  page: number = 1;
  perPage: number = 5;
  search?: string;
  repositories?: Repository;


  searchRepo(): void {
    this.githubService.getRepositories(this.page, this.perPage, this.search).subscribe(root => {
      if (root.items.length > 0) {
        this.repositories = root;
      }
    })
  }

  formatDescription(description: string) {
    return emojify(description);
  }

}


import { Component } from '@angular/core';
import { GithubService } from '../../services/github.service'


@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.css']
  
})

export class SearchPageComponent {
  
  // Variables >:O
  projects : any[] = [];
  search: string = '';

  // Constructor
  constructor(private githubService : GithubService) {}

  // Get the query and put all the stuff inside the projects array
  searchProject(): void {
    this.githubService.searchProjects(this.search).subscribe(
      (data) => {
        this.projects = data.items;
      },
      (error) => {
        console.log(error);
      }
      );
  }

}

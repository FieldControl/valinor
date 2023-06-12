import { Component } from '@angular/core';
import { GithubService } from '../../services/github.service'


@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.css']

})

export class SearchPageComponent {

  // Variables >:O
  projects: any[] = [];
  issues: any[] = [];
  search: string = '';

  // Constructor
  constructor(private githubService: GithubService) { }

  // Take the input, get the json from api and store in a var
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

  // Get the issues by the project name, get the json from api and puts in a var
  searchIssues(issue: any): void {
    this.githubService.searchIssues(issue).subscribe(
      (data) => {
        this.issues = data.items;
      },
      (error) => {
        console.log(error);
      }
    );
  }

}

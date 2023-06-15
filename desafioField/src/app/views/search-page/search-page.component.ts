import { Component, OnInit  } from '@angular/core';
import { GithubService } from '../../services/github.service'


@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.css']

})

export class SearchPageComponent {


  issuesPage = 1;
  totalIssues = 0;
  currentIssue= '';

  // Variables >:O
  projects: any[] = [];
  issues: any[] = [];
  search: string = '';

  // Pagination
  currentPage : number =1;
  pageCount : number = 0;

  // Constructor
  constructor(private githubService: GithubService) { }

  // Take the input of user and gets the resuts of teh api
  searchProject(newQuery: boolean): void {
    if (newQuery) {
      this.currentPage=  1;
    } 
    this.githubService.searchProjects(this.search,this.currentPage).subscribe(
      (data) => {
        this.projects = data.items;
        this.pageCount = data.total_count;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  // Get the issues of the project
  searchIssue(issue: string): void {
    this.githubService.searchIssues(issue,this.issuesPage).subscribe(
      (data) => {
        this.issues = data.items;
        this.totalIssues = data.total_count;
        this.currentIssue =issue;
      },
      (error) => {
        console.log(error);
      }
    );
  }


  // *** If you search up to 1000 results the API show the message: "Only the first 1000 search results are available" :C

  // pagination event to render again wen the user change pages
  renderProjects(event: number) {
    this.currentPage = event;
    this.searchProject(false) 
  }
  
  // Pagination event that render again wen the user change the issues page
  renderIssues(event: number) {
    this.issuesPage = event;
    this.searchIssue(this.currentIssue);
  }
}

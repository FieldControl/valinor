import { Component } from '@angular/core';
import { RepoService } from 'src/app/services/repo.service';
import { DrawerService } from 'src/app/services/drawer.service';
import { IssuesService } from 'src/app/services/issues.service';
import { QueryService } from 'src/app/services/query.service';
import { ShowSearchResultsService } from 'src/app/services/show-search-results.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  query:string = '';
  constructor(
    private repoService : RepoService, 
    private drawerService: DrawerService,
    private issuesService: IssuesService,
    private queryService: QueryService,
    public showresultsSearch: ShowSearchResultsService) 
    { } 

  search(){
    if (this.queryService.getCurrentQueryService() === 'repo') {
      this.repoService.query = this.query;
      this.repoService.searchRepo(this.repoService.currentPage, this.repoService.pageSize);
    } else {
      // Assuming 'issues' is the current query service
      this.issuesService.query = this.query;
      this.issuesService.searchIssues(this.issuesService.currentPage, this.issuesService.pageSize);
    }
  
  }

  toggle(){
    this.drawerService.toggle();
  }
}


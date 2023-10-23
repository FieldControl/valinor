import { Component, OnInit } from '@angular/core';
import { IssuesService } from 'src/app/services/issues.service';
import { RepoService } from 'src/app/services/repo.service';
import { DrawerService } from 'src/app/services/drawer.service';
import { QueryService } from 'src/app/services/query.service';
import { ShowSearchResultsService } from 'src/app/services/show-search-results.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent {

  query: string = '';
  showFiller = false;
  sidenavOC: boolean = true;
  full_name: string = '';
  issuesData: any;


  constructor(
    private issuesService: IssuesService,
    private repoService: RepoService,
    private drawerService: DrawerService,
    private queryService: QueryService,
    public showresultsSearch: ShowSearchResultsService) { }

  ngOnInit() {
    this.drawerService.sidenavOC$.subscribe((isOpen) => {
      this.sidenavOC = isOpen;
    });
  }

  Issues() {
    this.queryService.setCurrentQueryService('issues');
    this.showresultsSearch.showI_b = true;
    this.showresultsSearch.showR_b = false;
    this.issuesService.issues = { items: [], total_count: 0};
    this.drawerService.toggle();
  }

  Repos() {
    this.queryService.setCurrentQueryService('repo');
    this.showresultsSearch.showI_b = false;
    this.showresultsSearch.showR_b = true;
    this.repoService.repos = { items: [], total_count: 0 };
    this.drawerService.toggle();
  }
}

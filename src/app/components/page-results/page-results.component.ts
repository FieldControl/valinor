import { Component, OnInit} from '@angular/core';
import { CheckResultsService } from 'src/app/services/check-results.service';
import { IssuesService } from 'src/app/services/issues.service';
import { RepoService } from 'src/app/services/repo.service';
import { ShowSearchResultsService } from 'src/app/services/show-search-results.service';

@Component({
  selector: 'app-page-results',
  templateUrl: './page-results.component.html',
  styleUrls: ['./page-results.component.css']
})
export class PageResultsComponent implements OnInit{
  pageSize = 30;
  showPaginatorR = false;
  showPaginatorI = false;
  constructor(
    public repoService: RepoService,
    public issuesService: IssuesService,
    public showresultsSearch: ShowSearchResultsService,
    public checkresults: CheckResultsService) { }

    ngOnInit() {
      this.checkresults.checkResults();
    }

  updateResults() {
    if (this.showresultsSearch.showR_b) {
      this.repoService.searchRepo(this.repoService.currentPage, this.repoService.pageSize);
      this.showPaginatorI = false;
      this.showPaginatorR = true;
    } else if (this.showresultsSearch.showI_b) {
      this.issuesService.searchIssues(this.issuesService.currentPage, this.issuesService.pageSize);
      this.showPaginatorI = true;
      this.showPaginatorR = false;
    }
  }

  updatePageSizeRepo(currentPage: number, newSize: number) {
    this.repoService.currentPage = currentPage;
    this.pageSize = newSize;
    this.updateResults();
  }

  updatePageSizeIssues(currentPage: number, newSize: number) {
    this.issuesService.currentPage = currentPage;
    this.pageSize = newSize;
    this.updateResults();
  }
}

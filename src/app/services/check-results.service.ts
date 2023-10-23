import { Injectable } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { RepoService } from './repo.service';
import { IssuesService } from './issues.service';
import { ShowSearchResultsService } from './show-search-results.service';

@Injectable({
  providedIn: 'root'
})
export class CheckResultsService {
  private intervalSubscription: Subscription;

  constructor(
    private repoService: RepoService,
    private issuesService: IssuesService,
    private showresultsSearch: ShowSearchResultsService) {
    this.intervalSubscription = new Subscription();
    this.checkResults();
  }

  public checkResults() {
    if (this.intervalSubscription && !this.intervalSubscription.closed) {
      this.intervalSubscription.unsubscribe();
    }
    this.intervalSubscription = interval(150).subscribe(() => {
      if ((typeof this.repoService.repos.total_count === 'undefined' || this.repoService.repos.total_count === 0) && this.showresultsSearch.showR_b === true) {
        this.showresultsSearch.showCI_b = false;
        this.showresultsSearch.showCR_b = true;
      } else {
        this.showresultsSearch.showCR_b = false;
      }
      if ((typeof this.issuesService.issues.total_count === 'undefined' || this.issuesService.issues.total_count === 0) && this.showresultsSearch.showI_b === true) {
        this.showresultsSearch.showCI_b = true;
        this.showresultsSearch.showCR_b = false;
      } else {
        this.showresultsSearch.showCI_b = false;
      }
    })
  }
}

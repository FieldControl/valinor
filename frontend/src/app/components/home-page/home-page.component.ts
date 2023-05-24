import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GitRepoService } from 'src/services/service-repo-git.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.sass'],
})
export class HomePageComponent {
  query: string = '';
  repositories$: Observable<any>;
  pageInfo: any;

  constructor(private githubRepoService: GitRepoService) {}

  searchRepositories() {
    if (!this.query || this.query.trim().length === 0) {
      return;
    }

    this.githubRepoService
      .searchRepositories(this.query, 10)
      .subscribe((repositories) => {
        this.repositories$ = of(repositories);
      });
  }

  loadMoreRepositories() {
    this.githubRepoService
      .searchRepositories(this.query, 10, this.pageInfo.endCursor)
      .subscribe((response) => {
        this.repositories$ = this.repositories$.pipe(
          tap((repositories: any) => {
            repositories.edges = [...repositories.edges, ...response.edges];
            this.pageInfo = response.pageInfo;
          })
        );
      });
  }
}

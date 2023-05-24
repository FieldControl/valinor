import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GitRepoService } from 'src/services/service-repo-git.service';

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
    this.repositories$ = this.githubRepoService
      .searchRepositories(this.query, 10)
      .pipe(
        tap((response) => {
          this.pageInfo = response.pageInfo;
          console.log(response);
        })
      );
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

import { Component } from '@angular/core';
import { Observable } from 'rxjs';
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
  page: number = 1;

  constructor(private githubRepoService: GitRepoService) {}

  searchRepositories() {
    if (!this.query || this.query.trim().length === 0) {
      return;
    }

    this.githubRepoService
      .searchRepositories(this.query, this.page, 5)
      .subscribe((repositories: any) => {
        this.repositories$ = of(repositories.items);
      });
  }

  loadMoreRepositories() {
    this.githubRepoService
      .searchRepositories(this.query, this.page, 5)
      .subscribe((response: any) => {
        this.repositories$ = of(response.items);
      });
  }

  previousPage() {
    if (this.page > 1) {
      this.page--;
      this.loadMoreRepositories();
    }
  }

  nextPage() {
    this.page++;
    this.loadMoreRepositories();
  }
}

import { HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { SortingType } from '@core/enums/sorting.type.enum';
import { GitHubRepo } from '@core/models/github/repo.model';
import { GithubService } from '@core/services/github.service';
import { MessageDialogService } from '@core/services/message-dialog.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  page: number = 1;
  totalCount?: number;
  querySearch: string = '';
  repositories: GitHubRepo[] = [];
  sortingSearch: SortingType = SortingType.BestMatch;

  constructor(
    private githubService: GithubService,
    private messageDialogService: MessageDialogService
  ) {}

  get handleTotalCount() {
    return this.totalCount! > 1000 ? 1000 : this.totalCount!;
  }

  get sortingType(): typeof SortingType {
    return SortingType;
  }

  onCheckSortingType(sortingType: SortingType) {
    this.sortingSearch = sortingType;
    this.onSearchRepos();
  }

  onSearchRepos() {
    if (this.querySearch) {
      var params = new HttpParams();
      params = params.append('page', this.page);
      params = params.append('sort', this.sortingSearch);
      params = params.append('q', this.querySearch.trim());

      this.githubService.searchRepos(params).subscribe((value) => {
        this.repositories = value.items;
        this.totalCount = value.totalCount;

        if (!this.repositories.length) {
          this.messageDialogService.showDialog({
            title: 'Ooops',
            content: 'No repositories found.',
          });
        }
      });
    }
  }

  changePage(event: number) {
    this.page = event;
    this.onSearchRepos();
  }
}

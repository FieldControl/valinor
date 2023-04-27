import { GithubRepositoriesService } from './../../services/repositoriesService/github-repositories.service';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() search!: string;
  @Output() pageChange: EventEmitter<number> = new EventEmitter();
  @Output() newRepositories = new EventEmitter<object>();

  constructor(public githubRepositoriesService: GithubRepositoriesService) {}

  get pages(): number[] {
    const pagesArray = [];
    const maxPages = 10;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pagesArray.push(i);
    }
    while (pagesArray.length < maxPages) {
      if (startPage > 1) {
        pagesArray.unshift(startPage - 1);
        startPage--;
      } else if (endPage < this.totalPages) {
        endPage++;
        pagesArray.push(endPage);
      } else {
        break;
      }
    }
    return pagesArray;
  }

  changePage(page: number) {
    if (page > 0 && page <= this.totalPages) {
      this.githubRepositoriesService
        .getRepositories(page, this.search !== '' ? this.search : 'br')
        .subscribe((response) => {
          this.currentPage = page;
          this.pageChange.emit(page);
          this.newRepositories.emit(response);
        });
      this.currentPage = page;
      this.pageChange.emit(page);
    }
  }
}

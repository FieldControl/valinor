import { Component } from '@angular/core';
import { Repository } from 'src/app/models/repository';
import { GithubService } from 'src/app/services/github.service';
import { emojify } from 'node-emoji';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})

export class SearchComponent {

  constructor(private githubService: GithubService) { }

  page: number = 1;
  perPage: number = 10;
  sortBy: string = "";
  search?: string;
  lastSearch?: string;
  lastSort?: string;
  lastEntries?: number;
  repositories?: Repository | undefined;
  totalPages: number = 1;
  paginator: number[] = [];


  searchRepo(): void {

    this.searchValidation();

    if (this.search) {
      this.page = this.shouldResetPage() ? 1 : this.page;

      this.githubService.getRepositories(this.page, this.perPage, this.search!, this.sortBy).subscribe(response => {

        this.repositories = response;
        this.totalPages = Math.ceil(response.total_count / this.perPage);
        this.configPaginator();
        console.log(this.perPage);
        this.lastSearch = this.search;
        this.lastSort = this.sortBy;
        this.lastEntries = this.perPage;

        this.paginator = [];
        for (let i = 1; i < this.totalPages; i++) {
          this.paginator.push(i);
        }
      })
    }

  }

  goToPage(targetPage: number): void {
    if (targetPage >= 1 && targetPage <= this.totalPages) {
      this.page = targetPage;
      this.searchRepo();
    }
  }

  visiblePages(): number[] {
    const maxVisiblePages = 5;

    const startPage = Math.max(1, this.page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => i + startPage);

    if (!pages.includes(1) && this.totalPages > 1) {
      pages.unshift(1);
    }

    return pages;
  }

  private searchValidation(): void {
    if (this.search?.trim().length == 0) {
      this.repositories = undefined;
      this.search = undefined;
    }
  }

  private shouldResetPage(): boolean {
    return this.search !== this.lastSearch || this.sortBy !== this.lastSort || this.perPage !== this.lastEntries;
  }

  configPaginator(): void {

    //Definindo limites máximos de página de acordo com o valor de PerPage configurado.
    const perPageLimits: Record<number, number> = {
      5: 200,
      10: 100,
      15: 67,
      20: 50,
      30: 34,
    };

    //Caso o valor de totalPages ultrapassar o valor máximo estabelecido, utiliza-se Math.min para exibir sempre o valor mínimo pré-estabelecido.
    this.totalPages = Math.min(perPageLimits[this.perPage] || this.totalPages, this.totalPages);

  }

  formatDescription(description: string) {
    return emojify(description);
  }

  formatStars(stargazers: number) {
    return stargazers > 999 ? `${(stargazers / 1000).toFixed(1)}k` : stargazers;
  }

  formatDataUpdated(dataString: string): string {
    const pushedAt = new Date(dataString);
    const dateNow = new Date();

    const pushedAgoInMilliseconds = Math.abs(dateNow.getTime() - pushedAt.getTime());
    const pushedAgoInHours = pushedAgoInMilliseconds / (1000 * 60 * 60);

    if (pushedAgoInHours >= 1) {
      const amountHoursTwoDays = 48;
      const amountHoursOneDay = 24;

      if (pushedAgoInHours >= amountHoursTwoDays) {
        return `on ${pushedAt.toLocaleString()}`;
      } else if (pushedAgoInHours >= amountHoursOneDay) {
        return 'yesterday';
      }

      return `${Math.floor(pushedAgoInHours)} hours ago`;
    }

    const pushedAgoInMinutes = pushedAgoInHours * 60;
    if (pushedAgoInMinutes >= 1) {
      return `${Math.floor(pushedAgoInMinutes)} minutes ago`;
    }

    return `${Math.floor(pushedAgoInMinutes * 60)} seconds ago`;
  }


}


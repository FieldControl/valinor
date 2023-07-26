import { Component, OnInit, HostListener } from '@angular/core';
import { SearchService } from '../search.service';
import { PaginationService } from '../pagination.service';
import * as dayjs from 'dayjs';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
})
export class ResultComponent implements OnInit {

  searchData: any;
  total_count: number = 0;
  total_topics: string[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  pagesToShow: number = 5;
  isMobileView: boolean = false;

  faCoffee = faCoffee;

  constructor(public searchService: SearchService, private paginationService: PaginationService) { }

  ngOnInit(): void {
    this.searchService.searchData$.subscribe((data: string[]) => {
      this.searchData = data;
      this.totalPages = Math.ceil(this.searchService.getTotalCount() / this.searchService.maxRepositoriesPerPage);
    });

    this.searchService.totalCount$.subscribe((totalCount: number) => {
      this.total_count = totalCount;
      this.totalPages = Math.ceil(totalCount / this.searchService.maxRepositoriesPerPage);
    });

    this.paginationService.currentPage$.subscribe((page: number) => {
      this.currentPage = page;
      this.searchService.search(this.searchData.query, this.currentPage);
    });

    this.onResize();
  }

  formatNumber(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    } else {
      return value.toString();
    }
  }

  formatDate(date: number): string {
    return dayjs(date).format('DD [de] MMM [de] YYYY');
  }

  setPage(page: number): void {
    this.paginationService.changePage(page);
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.isMobileView = window.innerWidth <= 768;
    this.updatePagesToShow();
  }

  updatePagesToShow(): void {
    this.pagesToShow = this.isMobileView ? 3 : 5;
  }

  generatePageArray(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(this.currentPage - Math.floor(this.pagesToShow / 2), 1);
    const endPage = Math.min(startPage + this.pagesToShow - 1, this.totalPages);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (!pages.includes(this.totalPages) && this.totalPages > 0) {
      pages.push(this.totalPages);
    }

    this.updatePagesToShow();

    return pages;
  }
}

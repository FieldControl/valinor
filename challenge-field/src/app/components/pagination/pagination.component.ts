import { Component, OnInit } from '@angular/core';
import { PaginationService } from '../pagination.service';
import { SearchService } from '../search.service';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnInit {
  currentPage: number = 1;
  totalPages: number = 1;

  constructor(
    private paginationService: PaginationService,
    private searchService: SearchService
  ) { }

  ngOnInit(): void {
    this.paginationService.getCurrentPageObservable().subscribe((page: number) => {
      this.currentPage = page;
    });

    this.searchService.totalCount$.subscribe((totalCount: number) => {
      this.totalPages = Math.ceil(totalCount / this.searchService.maxRepositoriesPerPage);
    });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.paginationService.changePage(this.currentPage + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.paginationService.changePage(this.currentPage - 1);
    }
  }
}

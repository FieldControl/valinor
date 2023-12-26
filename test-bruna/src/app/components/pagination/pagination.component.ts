import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
})
export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() itemsPerPage = 10;
  @Input() totalItems = 0;

  @Output() pageChange = new EventEmitter<number>();

  totalPages = 0;

  ngOnChanges(): void {
    this.calculateTotalPages();
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
  }

  onPageClick(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  getPages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  getPagesToShow(): number[] {
    const range = 1; 

    let start = Math.max(1, this.currentPage - range);
    let end = Math.min(this.totalPages, this.currentPage + range);

    const diff = range * 2 + 1 - (end - start + 1);
    if (diff > 0) {
      start = Math.max(1, start - diff);
      end = Math.min(this.totalPages, end + diff);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

}
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})

export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() perPage: number = 12;
  @Input() totalPages: number;
  @Output() pageChange = new EventEmitter<number>();


  constructor() {
    this.totalPages = Math.ceil(1000 / this.perPage);
  }

  public scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /*-- Fetch previous page data --*/
  prevPage() {
    if (this.currentPage > 1) {
      this.pageChange.emit(this.currentPage = this.currentPage - 1);
    }
    this.scrollTop();
  }

  /*-- Fetch new page data --*/
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.pageChange.emit(this.currentPage = this.currentPage + 1);
    }
    this.scrollTop();
  }

  /*-- Fetch first page data --*/
  firstPage() {
    this.pageChange.emit(this.currentPage = 1);
    this.scrollTop();
  }

  /*-- Fetch last page data --*/
  lastPage() {
    this.pageChange.emit(this.currentPage = this.totalPages);
    this.scrollTop()
  }

}

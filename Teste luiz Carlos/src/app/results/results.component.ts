import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Item } from '../item';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss'],
})
export class ResultsComponent implements OnInit {
  @Input() items: Item[] = [];
  @Output() page = new EventEmitter<number>();
  @Output() sort = new EventEmitter<{column: string, direction: boolean}>();
  pages: number[] = [];
  @Input() set numOfPages(value: number) {
    this.pages = Array(value);
  }
  @Input() currentPage = 0;
  @Input() sortDirection: any

  constructor() {}

  ngOnInit(): void {
  }

  onNext() {
    this.page.next(this.currentPage + 1);
  }

  onPrev() {
    this.page.next(this.currentPage - 1);
  }

  onPage(i: number) {
    this.page.next(i);
  }

  onSort(column: string) {
    this.sortDirection[column] = !this.sortDirection[column]
    this.sort.next({ column: column, direction: this.sortDirection[column]})
  }

  getSortDirection(column: string) {
    return this.sortDirection[column]
  }
}

import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent {
  @Input() repositories: any[] = [];
  @Input() currentPage: number = 1;
  private _totalPages: number = 1;

  @Output() pageChange: EventEmitter<number> = new EventEmitter<number>();

  @Input() set totalPages(value: number) {
    this._totalPages = Math.min(value, 100);
  }

  get totalPages(): number {
    return this._totalPages;
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }
}

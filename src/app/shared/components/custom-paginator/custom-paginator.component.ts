import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-custom-paginator',
  templateUrl: './custom-paginator.component.html',
  styleUrls: ['./custom-paginator.component.scss'],
})
export class CustomPaginatorComponent {
  @Input() itemsPerPage: number = 30;
  @Input() currentPage: number = 1;
  @Output() changePage = new EventEmitter<number>();

  pageChange($event: number) {
    this.currentPage = $event;
    this.changePage.emit(this.currentPage);
  }
}

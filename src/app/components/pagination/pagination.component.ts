import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent {

  @Input() totalPage?: number
  @Output() currentPage = new EventEmitter<number>()

  public page: number

  constructor() {
    this.page = 1
  }

  next = () => {
    this.page++
    this.currentPage.emit(this.page)
  }

  previous = () => {
    this.page--
    this.currentPage.emit(this.page)
  }

}

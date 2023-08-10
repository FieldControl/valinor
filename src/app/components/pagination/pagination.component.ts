import { Component, EventEmitter, Output, Input } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import PaginationModel from 'src/app/models/pagination';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.sass'],
})
export class PaginationComponent {
  @Input() length: number = 100;
  @Output() paginationEvent = new EventEmitter<PaginationModel>();

  public getServerData(event?: PageEvent) {

    let currentPage: number | undefined;
    currentPage = (event?.pageIndex as number) + 1;

    this.paginationEvent.emit(new PaginationModel(currentPage, event?.pageSize, localStorage.getItem("queryString") as string));
  }
}
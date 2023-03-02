import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { PageEvent } from '@angular/material';
import { Champion } from '../champion.model';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.css']
})
export class PaginatorComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {}

  @Output() pageChange:EventEmitter<PageEvent> = new EventEmitter

  pageLength = 162
  pageIndex = 0;

  pageEvent: PageEvent = new PageEvent;

  handlePageEvent(event: PageEvent) {
    this.pageChange.emit(event)
  }

}

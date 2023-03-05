import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
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

  @Input() pageLength = 162
  @Input() pageIndex = 0;
  @Input() pageSizeOptions:number = 10

  pageEvent: PageEvent = new PageEvent;

  handlePageEvent(event: PageEvent) {
    this.pageChange.emit(event)
  }

}

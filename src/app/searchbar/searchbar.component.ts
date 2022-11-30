import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.css'],
})

export class SearchbarComponent {
  @Output() queryEvent = new EventEmitter<string>();

  constructor() {}

  search(query: string) {
    this.queryEvent.emit(query)
  }
}
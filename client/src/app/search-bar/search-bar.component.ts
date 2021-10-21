import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css'],
})
export class SearchBarComponent implements OnInit {
  constructor() {}

  @Output() eventSearch = new EventEmitter<string>();

  ngOnInit(): void {}

  newSearch(value: string) {
    this.eventSearch.emit(value);
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent {
  @Output() searchTextEvent = new EventEmitter<string>();

  onSubmit(searchText: string) {
    this.searchTextEvent.emit(searchText);
  }
}

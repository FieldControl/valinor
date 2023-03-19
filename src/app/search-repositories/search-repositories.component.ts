import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-search-repositories',
  templateUrl: './search-repositories.component.html',
  styleUrls: ['./search-repositories.component.css']
})
export class SearchRepositoriesComponent {

  @Output() public emmitSearch: EventEmitter<string> = new EventEmitter();

  public submitForm(value: string) {
    this.emmitSearch.emit(value)
  }
}

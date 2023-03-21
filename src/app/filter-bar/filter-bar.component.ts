import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-filter-bar',
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.css']
})
export class FilterBarComponent {
  @Output() public emmitSearch: EventEmitter<string> = new EventEmitter();

  constructor() {}

  ngOnInit(): void {

  }

  public search(value: string) {
    this.emmitSearch.emit(value);
  }
}

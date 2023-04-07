import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-search-options-component',
  templateUrl: './search-options-component.component.html',
  styleUrls: ['./search-options-component.component.css'],
})
export class SearchOptionsComponentComponent {
  @Output() optionsChange = new EventEmitter<number>();
  @Output() searchChange = new EventEmitter<string>();

  formatLabel(value: number): string {
    switch (value) {
      case 1:
        return '5';
      case 2:
        return '10';
      case 3:
        return '20';
      case 4:
        return '50';
      case 5:
        return '100';
      default:
        return '';
    }
  }

  searchChanged(event: any) {
    if (event.target)
      this.searchChange.emit(event.target.value);
  }

  optionChanged(event: any) {
    const element = event.srcElement;
    const value = parseInt(element.getAttribute('aria-valuetext'));
    this.optionsChange.emit(value);
  }
}

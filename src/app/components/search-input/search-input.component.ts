import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaginationBtnComponent } from '../pagination-btn/pagination-btn.component';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [FormsModule, PaginationBtnComponent],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.css',
})
export class SearchInputComponent {
  name: string = '';
  teste: any = new PaginationBtnComponent();
  @Output() setSearchOutput = new EventEmitter();

  toSearch() {
    this.setSearchOutput.emit(this.name);
  }
}

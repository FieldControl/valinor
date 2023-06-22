import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatInputModule, MatIconModule],
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss'],
})
export class SearchInputComponent {
  @Output() searchEvent: EventEmitter<string> = new EventEmitter();

  onClick(searchTerm: string) {
    this.searchEvent.emit(searchTerm);
  }
}

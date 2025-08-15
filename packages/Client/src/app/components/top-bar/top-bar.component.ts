import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class TopBarComponent {
  isAdding = false;
  newColumnName = "";
  @Output() newColumn = new EventEmitter<string>();

  toggleInput() {
    this.isAdding = !this.isAdding;
  }

  addColumn() {
    this.newColumn.emit(this.newColumnName);
    this.toggleInput();
    this.newColumnName = "";
  }
}

import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent {
  @Output() newColumn = new EventEmitter<void>();

  addColumn() {
    console.log("'Create Column' button clicked");
    this.newColumn.emit();
  }
}

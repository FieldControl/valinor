import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-column',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './column.component.html',
  styleUrl: './column.component.css',
})
export class ColumnComponent {
  @Input() title: string = '';
  @Output() clickEventTask = new EventEmitter<void>();

  sendEventEmitNewTask() {
    this.clickEventTask.emit();
  }
}

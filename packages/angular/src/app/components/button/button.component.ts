import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [MatButtonModule, MatDividerModule, MatIconModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
})
export class ButtonComponent {
  @Input() buttonType = '';
  @Output() clickEventProject = new EventEmitter<void>();
  @Output() clickEventColumn = new EventEmitter<void>();

  sendEventEmitNewProject() {
    this.clickEventProject.emit();
  }

  sendEventEmitNewColumn() {
    this.clickEventColumn.emit();
  }
}

import { Component } from '@angular/core';
import { ColumnService } from '../../services/column.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-column',
  imports: [FormsModule],
  templateUrl: './create-column.component.html',
  styleUrl: './create-column.component.css'
})
export class CreateColumnComponent {
  constructor(private columnService: ColumnService) {}

  isCreatingColumn: boolean = false;
  newColumnName: string = '';

  startCreatingColumn() {
    this.isCreatingColumn = true;
  }

  cancelCreatingColumn() {
    this.isCreatingColumn = false;
    this.newColumnName = '';
  }

  async createColumn(event: Event) {
    event.preventDefault();

    if (!this.newColumnName.trim()) return;

    try {
      await this.columnService.createColumn(this.newColumnName);
      this.newColumnName = '';
    } catch (error) {
      console.error('Error creating column:', error);
    }
  }
}

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button';
import { ColumnService } from '../../services/column.service';

@Component({
  selector: 'app-create-column-modal',
  standalone: true,
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule, MatDialogModule],
  templateUrl: './create-column-modal.component.html',
  styleUrl: './create-column-modal.component.scss'
})
export class CreateColumnModalComponent {
  columnName = '';

  constructor(
    public dialogRef: MatDialogRef<CreateColumnModalComponent>,
    private columnService: ColumnService
  ) {
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.columnService.createColumn({ name: this.columnName })
    this.dialogRef.close();
  }
}

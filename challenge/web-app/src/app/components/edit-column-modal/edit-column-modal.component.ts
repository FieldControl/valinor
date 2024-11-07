import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ColumnService } from '../../services/column.service';
import { Column } from '../../interfaces/column';

@Component({
  selector: 'app-edit-column-modal',
  standalone: true,
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule, MatDialogModule],
  templateUrl: './edit-column-modal.component.html',
  styleUrl: './edit-column-modal.component.scss'
})
export class EditColumnModalComponent {
  columnName = this.data.column.name;

  constructor(
    public dialogRef: MatDialogRef<EditColumnModalComponent>,
    private columnService: ColumnService,
    @Inject(MAT_DIALOG_DATA) public data: {column: Column}
  ) {
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.columnService.editColumn(this.data.column.id, { name: this.columnName })
    this.dialogRef.close();
  }

}

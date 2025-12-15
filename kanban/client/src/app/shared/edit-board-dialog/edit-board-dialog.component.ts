import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

export interface EditBoardDialogData {
  name: string;
}

@Component({
  selector: 'app-edit-board-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    // Material
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './edit-board-dialog.component.html'
})
export class EditBoardDialogComponent {
  name = '';

  constructor(
    private dialogRef: MatDialogRef<EditBoardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditBoardDialogData,
  ) {
    this.name = data.name;
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  save(): void {
    if (!this.name.trim()) return;
    this.dialogRef.close({ name: this.name.trim() });
  }
}

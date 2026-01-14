import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

export interface EditColumnDialogData {
  title: string;
}

@Component({
  selector: 'app-edit-column-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    //Material
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './edit-column-dialog.component.html',
})
export class EditColumnDialogComponent {
  title = '';

  constructor(
    private dialogRef: MatDialogRef<EditColumnDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditColumnDialogData,
  ) {
    this.title = data.title;
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  save(): void {
    if (!this.title.trim()) return;
    this.dialogRef.close({ title: this.title.trim() });
  }
}

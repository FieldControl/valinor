import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

export interface EditCardDialogData {
  title: string;
  description?: string | null;
  dueDate?: string | null;
  readonly?: boolean;
}

@Component({
  selector: 'app-edit-card-dialog',
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
  templateUrl: './edit-card-dialog.component.html',
})
export class EditCardDialogComponent {
  title = '';
  description = '';
  dueDate = '';

  isReadonly = true;

  constructor(
    private dialogRef: MatDialogRef<EditCardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditCardDialogData,
  ) {
    this.title = data.title;
    this.description = data.description ?? '';
    this.dueDate = data.dueDate ?? '';
    this.isReadonly = data.readonly != false;
  }

  enableEdit(): void {
    this.isReadonly = false;
  }

  close(): void {
    this.dialogRef.close(null);
  }

  save(): void {
    if (!this.title.trim()) return;

    this.dialogRef.close({
      title: this.title.trim(),
      description: this.description.trim() || undefined,
      dueDate: this.dueDate || undefined,
    });
  }
}

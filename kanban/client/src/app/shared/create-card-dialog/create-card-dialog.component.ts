import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-create-card-dialog',
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
  templateUrl: 'create-card-dialog.component.html',
  styleUrl: 'create-card-dialog.component.scss'
})
export class CreateCardDialogComponent {
  title = '';
  description = '';
  dueDate = '';

  constructor(
    private dialogRef: MatDialogRef<CreateCardDialogComponent>,
  ) {}

  cancel(): void {
    this.dialogRef.close(null);
  }

  confirm(): void {
    if (!this.title.trim()) return;
    this.dialogRef.close({
      title: this.title.trim(),
      description: this.description.trim() || undefined,
      dueDate: this.dueDate || undefined,
    });
  }
}

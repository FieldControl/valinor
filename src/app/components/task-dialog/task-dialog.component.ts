import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormComponent } from '../form/form.component'; // import seu form
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, FormComponent, MatIcon],
  templateUrl: './task-dialog.component.html',
  styleUrl: './task-dialog.component.css'
})
export class TaskDialogComponent {
  constructor(private dialogRef: MatDialogRef<TaskDialogComponent>) {}

  close() {
    this.dialogRef.close();
  }
}
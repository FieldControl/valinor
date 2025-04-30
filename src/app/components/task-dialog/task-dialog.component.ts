import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormComponent } from '../form/form.component';
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
  constructor(private dialogRef: MatDialogRef<TaskDialogComponent>) {} // Módulo para criação de modal - Angular Material Design UI 

  close() {
    this.dialogRef.close(); // Método fechar modal ao clicar no ícone "close" - canto superior direito. 
  }
}
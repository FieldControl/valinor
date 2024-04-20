import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Task } from '../task/task';
// Componente do task dialog;
@Component({
  selector: 'app-task-dialog',
  templateUrl: './task-dialog.component.html',
  styleUrl: './task-dialog.component.css'
})
// Exportando classe para ser usada no app principal;
export class TaskDialogComponent {
  title = 'TaskDialog';
  // Cria variável que pode conter ou não todos os atributos da tarefa;
  private backupTask: Partial<Task> = { ...this.data.task };
  // Construtor da classe TaskDialogComponent;
  constructor(
    public dialogRef: MatDialogRef<TaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskDialogData
  ) {}
  // Quando a operção é cancelada;
  cancel(): void {
    this.data.task.title = this.backupTask.title;
    this.data.task.description = this.backupTask.description;
    this.data.task.coluna = this.backupTask.coluna;
    this.dialogRef.close(this.data);
  }
}
// Exportando classe para edição da tarefa;
export interface TaskDialogData {
  task: Partial<Task>;
  enableDelete: boolean;
}
// Resultado que é retornado;
export interface TaskDialogResult {
  task: Task;
  delete?: boolean;
}

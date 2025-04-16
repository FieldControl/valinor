import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Task } from '../../../interface/task.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-dialog-add-task',
  templateUrl: './dialog-add-task.component.html',
  styleUrls: ['./dialog-add-task.component.scss'],
  imports:[ 
    CommonModule,
    FormsModule,
  ]
})
export class DialogAddTaskComponent {
  constructor(private dialogRef: MatDialogRef<DialogAddTaskComponent>, private dialog: MatDialog) {}
  
  public task: Task = {
    _id: '',
    userId: '',
    title: '',
    description: '',
    status: 'To-do',
    priorityLevel: 3,
    initDate: new Date(),
    endDate: undefined
  };


  onSubmit(): void {
    // Envia a tarefa criada para o componente pai
    this.dialogRef.close(this.task);
  }

  onCancel(): void {
    // Fecha o modal sem salvar
    this.dialogRef.close();
  }
}
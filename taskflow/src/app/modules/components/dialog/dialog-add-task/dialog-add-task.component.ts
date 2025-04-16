
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Task } from '../../../interface/task.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, Inject, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-dialog-add-task',
  templateUrl: './dialog-add-task.component.html',
  styleUrls: ['./dialog-add-task.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class DialogAddTaskComponent implements OnInit {
  public titleDialog: string = 'Adicionar Nova Tarefa';

  constructor(private dialogRef: MatDialogRef<DialogAddTaskComponent>,@Inject(MAT_DIALOG_DATA) public data: {taskEdit: Task}) {}

  public task: Task = {
    _id: '',
    userId: '',
    title: '',
    description: '',
    status: 'To-do',
    priorityLevel: 3,
    initDate: new Date(),
    endDate: undefined,
  };

  ngOnInit(): void {
    if (this.data.taskEdit) {
      this.editDialog();
    }
    console.log('taskEdit recebido no ngOnInit:', this.data.taskEdit?.description);
  }

  public editDialog(): void {
    if (this.data.taskEdit !== null) {
      this.task = this.data.taskEdit;
      this.titleDialog = 'Editar Tarefa';
    }
  }

  onSubmit(): void {
    this.dialogRef.close(this.task);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
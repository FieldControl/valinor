import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Task } from '../../../interface/task.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { TaskService } from '../../../service/task.service';
import { AuthService } from '../../../service/auth.service';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dialog-add-task',
  templateUrl: './dialog-add-task.component.html',
  styleUrls: ['./dialog-add-task.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class DialogAddTaskComponent implements OnInit {
  @Output() taskUpdated = new EventEmitter<void>();
  public initDateFormatted: string = '';
  public endDateFormatted: string = '';
  public userId: string = '';

  public titleDialog: string = 'Adicionar Nova Tarefa';

  constructor(
    private dialogRef: MatDialogRef<DialogAddTaskComponent>,
    private taskService: TaskService,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data?: { taskEdit: Task },
  ) {
  }

  public task: Task = {
    _id: '',
    userId: '',
    title: '',
    description: '',
    status: 'To-do',
    priorityLevel: 3,
    initDate: new Date,
    endDate: undefined,
  };

  ngOnInit(): void {
    this.initDateFormatted = this.formatDateForInput(this.task.initDate);
    if (this.data) {
      this.editDialog();
      console.log(
      'taskEdit recebido no ngOnInit:',
      this.data.taskEdit?.description,
    );
    this.endDateFormatted = this.task.endDate
      ? this.formatDateForInput(this.task.endDate)
      : '';
    }    
  }

  public editDialog(): void {
    if (this.data) {
      this.task = this.data.taskEdit;
      this.titleDialog = 'Editar Tarefa';
    }
  }

  onSubmit(): void {
    this.task.initDate = new Date(this.initDateFormatted);
    this.task.priorityLevel = Number(this.task.priorityLevel )  
    this.task.userId = this.authService.getUser()?.login._id as string|| '';
    this.task.endDate = this.endDateFormatted
    ? new Date(this.endDateFormatted)
    : undefined;
    if (this.data) {
      this.taskService.updateTask(this.task).then(() => {
        this.taskUpdated.emit();
        this.dialogRef.close(this.task);
      });
    } else {
      this.taskService.createTask(this.task).then(() => {
        this.taskUpdated.emit();
        this.dialogRef.close(this.task);
      });
    }
    this.dialogRef.close();
  }

  onCancel(): void {
    this.dialogRef.close();
  }
  
  formatDateForInput(date: string | Date | null | undefined): string {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return '';
    }

    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}

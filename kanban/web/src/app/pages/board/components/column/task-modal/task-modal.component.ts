import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiServiceService } from 'src/app/core/api/api-service.service';
import { BoardService } from '../../../board.service';

@Component({
  selector: 'app-task-modal',
  templateUrl: './task-modal.component.html',
  styleUrls: ['./task-modal.component.scss'],
})
export class TaskModalComponent {
  taskName: string = '';
  description: string = '';
  columnId: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { columnId: string },
    private apiService: ApiServiceService,
    private boardService: BoardService,
    private dialogRef: MatDialogRef<TaskModalComponent>
  ) {}

  addTask() {
    this.apiService
      .addTask({
        title: this.taskName,
        description: this.description,
        columnId: this.data.columnId,
      })
      .subscribe(
        (data) => {
          this.boardService.search$.next();
          this.dialogRef.close();
        },
        (error) => {
          console.error('Erro ao adicionar task:', error);
        }
      );
  }
}

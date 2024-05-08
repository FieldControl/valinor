import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Component, Input } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  ApiServiceService,
  Column,
  Task,
} from 'src/app/core/api/api-service.service';
import { TaskModalComponent } from './task-modal/task-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-column',
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.scss'],
})
export class ColumnComponent {
  @Input({ required: true }) column!: Column;
  boardId: string = '';

  constructor(private api: ApiServiceService, private MatDialog: MatDialog) {}

  openDialog() {
    const dialogRef = this.MatDialog.open(TaskModalComponent, {
      width: '450px',
      data: {
        columnId: this.column.id,
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log('The dialog was closed');
    });
  }

  async drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      await firstValueFrom(
        this.api.updateTask({
          columnId: event.container.id,
          id: event.item.data.id,
        })
      );
    }
  }
}

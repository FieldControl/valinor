import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { LaneService } from '../../../services/lane.service';
import { BoardModel } from '../../../models/board.model';
import { LaneModel } from '../../../models/lane.model';
import { ModalLaneComponentComponent } from '../../modal-lane-component/modal-lane.component';
import { ModalAddTaskComponent } from '../../task/modal-add-task/modal-add-task.component';
import { TaskComponent } from '../../task/task.component';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskModel } from '../../../models/task.model';
import { TaskService } from '../../../services/task.service';

@Component({
  selector: 'app-modal-view-board',
  standalone: true,
  imports: [DragDropModule, MatCardModule, MatButtonModule, MatDialogModule, TaskComponent],
  templateUrl: './modal-view-board.component.html',
  styleUrl: './modal-view-board.component.css'
})
export class ModalViewBoardComponent implements OnInit {

  board: BoardModel = new BoardModel();
  lanes: LaneModel[] = [];
  listLanes: any = {};

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<ModalViewBoardComponent>, private laneService: LaneService, private taskService: TaskService, private dialog: MatDialog) {
    if (data) {
      console.log(data);
      this.board = data;
    }
  }
  deleteLane(lane: LaneModel) {
    this.laneService.deleteLane(lane.id.toString()).subscribe((data) => {
      this.lanes = this.lanes.filter(x => x.id !== lane.id);
    });
  }
  ngOnInit(): void {
    this.laneService.getLanes(this.board.id).subscribe((data: LaneModel[]) => {
      this.lanes = data;
    });
  }
  closeModal() {
    this.dialogRef.close();
  }
  openModalLane() {
    const dialogRef = this.dialog.open(ModalLaneComponentComponent, {
      width: '95%',
      data: this.board
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.ngOnInit();
    });
  }
  addTask(lane?: LaneModel) {
    const dialogRef = this.dialog.open(ModalAddTaskComponent, {
      width: '1000',
      data: lane
    });

    dialogRef.afterClosed().subscribe(result => {
      this.ngOnInit();
    });
  }

  drop(event: CdkDragDrop<TaskModel[]>) {
    console.log(event);
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      this.updateTask(event.container.data[event.currentIndex], Number(event.container.id.replace('lane', '')));

    }
  }
  updateTask(task: TaskModel, laneId: number) {
    task.laneId = laneId;
    this.taskService.updateTask(task).subscribe((data) => {
      console.log('task updated successfully');
    });
  }
}



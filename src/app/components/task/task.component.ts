import { Component, OnInit } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';
import { MatDialog } from '@angular/material/dialog'; 

@Component({
  selector: 'app-task',
  standalone: true, 
  imports: [MatIconModule, MatDividerModule, MatButtonModule, MatMenuModule, MatDialogModule], 
  templateUrl: './task.component.html',
  styleUrl: './task.component.css'
})

export class TaskComponent {
  constructor(private dialog: MatDialog) {}

  openDialog() {
    const dialogRef = this.dialog.open(TaskDialogComponent , {width: "40%"});

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Nova tarefa:', result);
        // this.taskService.addTask(result);
      }
    });
  }

}
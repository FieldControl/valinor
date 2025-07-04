import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task } from 'src/app/interface/task';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent {

  @Input() task: Task | null = null;
  @Output() edit = new EventEmitter<Task>();

}

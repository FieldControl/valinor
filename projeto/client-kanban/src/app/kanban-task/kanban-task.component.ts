import { Component, Input } from '@angular/core';
import { Task } from '../shared/models/task';

@Component({
  selector: 'app-kanban-task',
  imports: [],
  templateUrl: './kanban-task.component.html',
  styleUrl: './kanban-task.component.css'
})
export class KanbanTaskComponent {
  @Input() task!: Task
}

import { Component } from '@angular/core';
import { KanbanTaskComponent } from '../kanban-task/kanban-task.component';

@Component({
  selector: 'app-kanban-column',
  imports: [KanbanTaskComponent],
  templateUrl: './kanban-column.component.html',
  styleUrl: './kanban-column.component.css'
})
export class KanbanColumnComponent {

}

import { Component } from '@angular/core';
import { KanbanBoardComponent } from '../app/components/kanban-board/kanban-board.component'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [KanbanBoardComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'kanban-frontend';
}

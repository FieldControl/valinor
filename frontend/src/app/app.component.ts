import { Component } from '@angular/core';
import { KanbanBoardComponent } from './kanban-board/kanban-board.component';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <div class="app-container">
      <h1>Kanban Board</h1>
      <app-kanban-board></app-kanban-board>
    </div>
  `,
  styles: [
    `
      .app-container {
        padding: 20px;
      }
    `,
  ],
  imports: [KanbanBoardComponent],
})
export class AppComponent {}

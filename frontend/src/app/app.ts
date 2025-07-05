import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KanbanBoardComponent } from './kanban-board/kanban-board.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, KanbanBoardComponent],
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>Kanban Board</h1>
      </header>
      <main class="app-main">
        <app-kanban-board></app-kanban-board>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background-color: #f5f7fa;
    }

    .app-header {
      background-color: #2c3e50;
      color: white;
      padding: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .app-header h1 {
      margin: 0;
      font-size: 1.8rem;
      text-align: center;
    }

    .app-main {
      padding: 2rem;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
  `]
})
export class AppComponent {
  title = 'kanban-app';
}

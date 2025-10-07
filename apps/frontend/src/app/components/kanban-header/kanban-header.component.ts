// Angular Core
import { Component } from '@angular/core';

@Component({
  selector: 'app-kanban-header',
  standalone: true,
  template: `
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Kanban Board</h1>
      <p class="text-gray-600">Organize suas tarefas de forma visual</p>
    </div>
  `,
  styles: [],
})
export class KanbanHeaderComponent {}

// Angular Router
import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./components/kanban-board/kanban-board.component').then(
        (m) => m.KanbanBoardComponent
      ),
  },
];

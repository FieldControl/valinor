import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/boards',
    pathMatch: 'full'
  },
  {
    path: 'boards',
    loadComponent: () => import('./components/board-list/board-list.component').then(m => m.BoardListComponent)
  },
  {
    path: 'board/:id',
    loadComponent: () => import('./components/kanban-board/kanban-board.component').then(m => m.KanbanBoardComponent)
  },
  {
    path: '**',
    redirectTo: '/boards'
  }
]; 
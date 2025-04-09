import { Routes } from '@angular/router';
import { KanbanPage } from './kanban/kanban.page';

export const routes: Routes = [
  {
    path: '',
    component: KanbanPage
  },
  {
    path: '**',
    redirectTo: ''
  }
];
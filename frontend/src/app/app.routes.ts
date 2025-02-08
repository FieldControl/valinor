import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/boards', pathMatch: 'full' },
  {
    path: 'boards',
    loadComponent: () =>
      import('./features/boards/list/list.component').then(
        (m) => m.ListComponent
      ),
  },
  {
    path: 'boards/:id',
    loadComponent: () =>
      import('./features/boards/detail/detail.component').then(
        (m) => m.DetailComponent
      ),
  },
];

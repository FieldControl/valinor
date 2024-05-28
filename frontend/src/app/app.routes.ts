import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/account/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/account/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'boards',
    loadComponent: () =>
      import('./features/boards/list/list.component').then(
        (m) => m.ListComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'boards/:id',
    loadComponent: () =>
      import('./features/boards/detail/detail.component').then(
        (m) => m.DetailComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];

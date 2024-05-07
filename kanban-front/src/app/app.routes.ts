import { Routes } from '@angular/router';
import { UserListComponent } from './pages/user-list/user-list.component';



export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    {
      path: 'login',
      loadComponent: () =>
        import('./pages/login/login.component').then(
          (m) => m.LoginComponent
        ),
    },
    {
      path: 'register',
      loadComponent: () =>
        import('./pages/register/register.component').then(
          (m) => m.RegisterComponent
        ),
    },
    {
      path: 'users',
      loadComponent: () =>
        import('./pages/user-list/user-list.component').then(
          (m) => m.UserListComponent
        ),
    },
    {
      path: 'boards',
      loadComponent: () =>
        import('./pages/boards/boards.component').then(
          (m) => m.BoardsComponent
        ),
    },
    {
      path: 'boards/:id',
      loadComponent: () =>
        import('./pages/board-detail/board-detail.component').then(
          (m) => m.BoardDetailComponent
        ),
    },

];

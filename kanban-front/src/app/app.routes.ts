import { Routes } from '@angular/router';
import { UserListComponent } from './pages/user-list/user-list.component';
import { AuthGuard } from './shared/services/auth.guard';



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
        canActivate: [AuthGuard]
    },
    {
      path: 'boards',
      loadComponent: () =>
        import('./pages/board-environment/boards/boards.component').then(
          (m) => m.BoardsComponent
        ),
        canActivate: [AuthGuard]
    },
    {
      path: 'boards/:id',
      loadComponent: () =>
        import('./pages/board-environment/board-detail/board-detail.component').then(
          (m) => m.BoardDetailComponent
        ),
        canActivate: [AuthGuard]
    },

];

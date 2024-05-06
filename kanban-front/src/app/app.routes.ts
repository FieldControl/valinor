import { Routes } from '@angular/router';
import { UserListComponent } from './pages/user-list/user-list.component';



export const routes: Routes = [
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

];

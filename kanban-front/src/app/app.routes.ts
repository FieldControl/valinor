import { Routes } from '@angular/router';
import { UserListComponent } from './pages/user-list/user-list.component';



export const routes: Routes = [
    {
        path: 'pages',
        loadComponent: () =>
          import('./pages/user-list/user-list.component').then(
            (m) => m.UserListComponent
          ),
      },

];

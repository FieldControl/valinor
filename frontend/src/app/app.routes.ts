import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'boards',
        loadComponent: () => import('./features/board/list/board.component').then(m => m.BoardComponent)
    },
    {
        path: 'board/add',
        loadComponent: () => import('./features/board/add-board/add-board.component').then(m => m.AddBoardComponent)
    }
];

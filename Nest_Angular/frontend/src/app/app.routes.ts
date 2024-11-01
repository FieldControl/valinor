import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
    // Rota para a página de login
    {
        path: 'login',
        loadComponent: () => import('./features/account/login/login.component').then(
            (m) => m.LoginComponent
        ),
    },
    // Rota para a página de registro
    {
        path: 'register',
        loadComponent: () => import('./features/account/register/register.component').then(
            (m) => m.RegisterComponent
        ),
    },
    // Rota para a página inicial
    {
        path: 'boards',
        loadComponent: () => import('./features/boards/list/list.component').then(
            (m) => m.ListComponent
        ),
        canActivate: [authGuard],
    },
    // Rota para a página de detalhes de um quadro
    {
        path: 'boards/:id',
        loadComponent: () => import('./features/boards/detail/detail.component').then(
            (m) => m.DetailComponent
        ),
        canActivate: [authGuard],
    },
    // Caso o usuario informe uma rota inexistente é levado para a pagina de login
    {
        path: '**',
        redirectTo: 'login',
    }
];
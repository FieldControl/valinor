import { Routes } from '@angular/router';
import{ authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () =>
            import('./feature/account/login/login.component').then(
                (m) => m.LoginComponent
            ),
    },
    {
        path:'register',
        loadComponent: () => 
            import('./feature/account/register/register.component').then(
                (m) => m.RegisterComponent
            ),
    },
    {
        path: 'boards',
        loadComponent: () =>
            import('./feature/boards/list/list.component').then(
                (m) => m.ListComponent
            ),
            canActivate: [authGuard],
    },
    {
        path: 'boards/:id',
        loadComponent: () =>
            import('./feature/boards/detail/detail.component').then(
                (m) => m.DetailComponent
            ),
            canActivate: [authGuard],
    },
    {
        path:'**',
        redirectTo: 'login',
    },
];

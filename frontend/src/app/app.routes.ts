import { Routes } from '@angular/router';
import { authGuard } from './shared/auth/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent:() => 
            import('./features/account/login/login.component').then(
                (m) => m.LoginComponent
            ),
    },
    {
        path: 'register',
        loadComponent:() => 
            import('./features/account/register/register.component').then(
                (m) => m.RegisterComponent
            ),
    },
    {
        path: 'quadros',
        loadComponent:() => 
            import('./features/quadros/lista/lista.component').then(
                (m) => m.ListaComponent
            ),
            canActivate:[authGuard]
    },
    {
        path: 'quadros/:id',
        loadComponent:() => 
            import('./features/quadros/detalhes/detalhes.component').then(
                (m) => m.DetalhesComponent
            ),
            canActivate:[authGuard]
    },
    {
        path: '**',
        redirectTo: 'login',
      },
];

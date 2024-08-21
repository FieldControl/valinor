import { Routes } from '@angular/router';
import { authGuard } from './compartilhado/guardar/autenticar.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./recursos/conta/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./recursos/conta/registro/registro.component').then(
        (m) => m.RegistrarComponent
      ),
  },
  {
    path: 'quadros',
    loadComponent: () =>
      import('./recursos/quadros/quadro-lista/quadro-lista.component').then(
        (m) => m.QuadroListaComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'quadros/:id',
    loadComponent: () =>
      import('./recursos/quadros/quadro-detalhes/quadro-detalhes.component').then(
        (m) => m.QuadroDetalhesComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];

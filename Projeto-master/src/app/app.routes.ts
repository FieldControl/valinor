import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './Auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./Pagina/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'pagina-principal',
    canActivate: [authGuard],
    loadComponent: () => import('./Pagina/pagina-principal/pagina-principal.component').then(m => m.PaginaPrincipalComponent)
  },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
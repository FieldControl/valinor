// src/app/app-routing.module.ts
import { NgModule }       from '@angular/core';
import { RouterModule,
         Routes }         from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { BoardComponent } from './features/board/board.component';
import { UsersComponent } from './features/users/users/users.component';
import { AuthGuard }      from './core/auth/auth.guard';

const routes: Routes = [
  { path: 'login',  component: LoginComponent },
  { path: 'board',  component: BoardComponent, canActivate: [AuthGuard] },
  { path: 'users',  component: UsersComponent, canActivate: [AuthGuard] },
  { path: '',       redirectTo: 'login', pathMatch: 'full' },
  { path: '**',     redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}

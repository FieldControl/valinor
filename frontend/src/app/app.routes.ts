import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LeaderDashboardComponent } from './components/leader-dashboard/leader-dashboard.component';
import { MemberDashboardComponent } from './components/member-dashboard/member-dashboard.component'
import { RegisterComponent } from './components/register/register.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // redireciona root para login
  { path: 'login', component: LoginComponent },
  { path: 'users/register', component: RegisterComponent },
  { path: 'dashboard/leader', component: LeaderDashboardComponent },
  { path: 'dashboard/member', component: MemberDashboardComponent },
  { path: '**', redirectTo: 'login' } // fallback para rota desconhecida
];

import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { AuthGuard } from './pages/login/auth.guard';
import { ProjectComponent } from './pages/project/project.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'project/:id', component: ProjectComponent },
  { path: '**', redirectTo: 'login' },
];

const token = document.cookie.split(';').find((cookie) => cookie.trim().startsWith('token='));

if (token) {
  routes[0].redirectTo = 'projects';
}

export const routing = RouterModule.forRoot(routes);

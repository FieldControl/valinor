import { Routes } from '@angular/router';
import {
  HomeComponent,
  RegisterUserComponent,
  DashboardComponent,
} from './pages/';
import { RouterGuard } from './guard/router.guard';
import { RenderProjectComponent } from './pages/render-project/render-project.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [RouterGuard],
  },
  {
    path: 'register',
    component: RegisterUserComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [RouterGuard],
  },
  {
    path: 'render-project/:id',
    component: RenderProjectComponent,
  },
];

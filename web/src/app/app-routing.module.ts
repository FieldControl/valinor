import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guard/auth-guard.service';
import { HomeComponent } from './modules/home/home.component';
import { SignUpComponent } from './modules/sign-up/sign-up.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
  },
  {
    path: 'register',
    component: SignUpComponent,
  },
  {
    path: 'kanban',
    loadChildren: () =>
      import('./modules/kanban/kanban.module').then((m) => m.KanbanModule),
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

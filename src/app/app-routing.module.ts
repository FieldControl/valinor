import { inject, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthService } from '@module/auth/auth.service';
import { SignInComponent } from '@module/auth/sign-in/sign-in.component';
import { SearchComponent } from '@module/search/search.component';
import { DashboardComponent } from '@shared/layouts/dashboard/dashboard.component';
import { NotFoundComponent } from '@shared/layouts/not-found/not-found.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'search',
  },
  {
    path: 'search',
    canActivate: [() => inject(AuthService).isAuthenticated()],
    component: DashboardComponent,
    children: [{ path: '', component: SearchComponent }],
  },
  {
    path: 'auth',
    children: [{ path: 'signin', component: SignInComponent }],
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

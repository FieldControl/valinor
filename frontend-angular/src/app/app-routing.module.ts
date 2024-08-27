import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccessComponent } from './components/formAcessComponets/access/access.component';
import { HomeComponent } from './components/homeCompenents/home/home.component';
import { authGuard } from './shared/guards/auth.guard';

const routes: Routes = [
  { path: 'acesso', component: AccessComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard]},
  { path: '**', redirectTo: 'acesso'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

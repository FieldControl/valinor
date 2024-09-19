import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccessComponent } from './components/formAcessComponets/access/access.component';
import { HomeComponent } from './components/homeCompenents/home/home.component';
import { authGuard } from './shared/security/guards/auth.guard';
import { DetailsComponent } from './components/boardsComponents/details/details.component';
import { ListComponent } from './components/boardsComponents/list/list.component';

const routes: Routes = [
  { path: 'acesso', component: AccessComponent},
  { path: 'boardsList', component: ListComponent, canActivate: [authGuard]},
  { path: 'boards/:id', component: DetailsComponent , canActivate: [authGuard]},
  { path: '**', redirectTo: 'acesso'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }

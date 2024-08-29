import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccessComponent } from './components/formAcessComponets/access/access.component';
import { HomeComponent } from './components/homeCompenents/home/home.component';
import { authGuard } from './shared/guards/auth.guard';
import { DetailsComponent } from './components/boardsComponents/details/details.component';
import { ListComponent } from './components/boardsComponents/list/list.component';
import { HelpComponent } from './components/informationComponents/help/help.component';
import { DeveloperComponent } from './components/informationComponents/developer/developer.component';

const routes: Routes = [
  { path: 'acesso', component: AccessComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard]},
  { path: '**', redirectTo: 'acesso'},
  { path: 'boardsDetails', component: DetailsComponent },
  { path: 'boardsList', component: ListComponent},
  { path: 'help', component: HelpComponent},
  { path: 'developer', component: DeveloperComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }

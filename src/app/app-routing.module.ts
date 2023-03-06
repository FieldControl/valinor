import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CardDetailsComponent } from './card-details/card-details.component';
import { CharacterListComponent } from './character-list/character-list.component';


import { HomeComponent } from './home/home.component';

const routes: Routes = [

  {path: '' , component: HomeComponent},
  {path: 'list',  component:CharacterListComponent},
  {path: 'details/:id', component: CardDetailsComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

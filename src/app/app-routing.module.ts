import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {CharactersComponent} from './component/characters/characters.component'

const routes: Routes = [
  {
    //rota direto para characters
    path:'', redirectTo: '/characters', pathMatch:'full'
  },
  {
    path:'characters', component: CharactersComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

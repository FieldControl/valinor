
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChampionsComponent } from '../Components/champions/champions.component';
import { ChampionsFreeComponent } from '../Components/champions-free/champions-free.component';

const routes: Routes = [
  {
    path:'',
    component: ChampionsComponent

  },
  {
    path:'rotation',
    component: ChampionsFreeComponent,

  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChampionsRoutingModule { }

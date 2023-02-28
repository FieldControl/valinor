import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  {
    path: 'champion/:name',
    loadChildren: () => import('./components/nav/module/nav.module').then(m => m.NavModule)
  }, {
    path: '',
    loadChildren: () => import('./view/home/module/home.module').then(m => m.HomeModule)
  }, {
    path: 'champion',
    loadChildren: () => import('./components/champions-view/module/champions.module').then(m => m.ChampionsModule)
  }, {
    path: 'skins',
    loadChildren: () => import('./components/skins-view/module/skins.module').then(m => m.SkinsModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

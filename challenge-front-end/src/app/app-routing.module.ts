import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules, UrlSegment } from '@angular/router';

import { HomeComponent } from 'core/pages/home/home.component';

export const appRoutes: Routes = [
  { path: 'feature', loadChildren: () => import('./feature/feature.module').then(m => m.FeatureModule)},
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: '**', component: HomeComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [
    /** preloadingStrategy: Carrega primeiro os módulos necessários para iniciar
     o app e depois carrega os que podem ser acessados pelo usuário
     */
    RouterModule.forRoot(appRoutes, {preloadingStrategy: PreloadAllModules})
  ],
  exports: [RouterModule],

})
export class AppRoutingModule {

}

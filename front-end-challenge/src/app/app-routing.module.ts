import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: '**', component: HomeComponent, pathMatch: 'full' },
];


@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

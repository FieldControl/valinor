import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
];
export const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: '**', redirectTo: '' }
];

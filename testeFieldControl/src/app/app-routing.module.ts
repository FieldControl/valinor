import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MovieComponent } from './movie/movie.component'; 
import { HomeComponent } from './home/home.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const routes: Routes = [

   { path:  '', pathMatch:  'full', redirectTo:  'login'},

   { path: 'login', component: LoginComponent},

   { path: 'movies', component: HomeComponent},

   { path: 'movies/:id', component: MovieComponent},

   { path: '**', component: PageNotFoundComponent }
 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }

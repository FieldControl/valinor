import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RepositoriosComponent } from './repositorios/repositorios.component';

const routes: Routes = [
  {
    path:'',
    component: HomeComponent
  },
  {
    path:'repositorios',
    component: RepositoriosComponent
  }
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

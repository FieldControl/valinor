import { ListaIssuesComponent } from './issues/lista-issues/lista-issues.component';
import { ListaRepositoriosComponent } from './repositorios/lista-repositorios/lista-repositorios.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {path: '', component: ListaRepositoriosComponent},
  {path: 'issues/:full_name', component: ListaIssuesComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

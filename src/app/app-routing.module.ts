import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './features/search-repositories/pages/home/home.component';
import { ListRepositoriesComponent } from './features/search-repositories/pages/list-repositories/list-repositories.component';

const routes: Routes = [
  {
    path: '',
    title: 'Buscador de Repositórios - GitHub',
    component: HomeComponent,
  },
  {
    path: 'search-results',
    title: 'Resultados da busca',
    component: ListRepositoriesComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

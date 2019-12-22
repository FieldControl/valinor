import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RepoSearchComponent } from './repo-search/repo-search.component';

const routes: Routes = [
  {
    path: '',
    component: RepoSearchComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RepositoriesRoutingModule { }

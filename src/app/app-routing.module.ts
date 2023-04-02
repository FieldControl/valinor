import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RepositoriesListComponent } from './pages/github-search/repositories-list/repositories-list.component';
import { RepositorieIssuesComponent } from './pages/github-search/repositorie-issues/repositorie-issues.component';

const routes: Routes = [
  {path:'', redirectTo:'list',pathMatch:'full'},
  {path:'list',component: RepositoriesListComponent},
  {path:'issue/:username/:reponame', component: RepositorieIssuesComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

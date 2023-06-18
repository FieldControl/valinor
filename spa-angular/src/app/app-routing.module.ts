import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GitSearchComponent } from './core/components/git-search/git-search.component';

const routes: Routes = [
  { path: '', component: GitSearchComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

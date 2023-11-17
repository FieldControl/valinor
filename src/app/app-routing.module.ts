import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './components/list/list.component';
import { UserComponent } from './components/user/user.component';
import { RepositoryComponent } from './components/repository/repository.component';

const routes: Routes = [{ path: '', component: ListComponent }, { path: 'usuario/:name', component: UserComponent }, { path: ':name/:repo', component: RepositoryComponent }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }

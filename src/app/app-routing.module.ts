import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'repositorios' },
  {
    path: 'repositorios',
    loadChildren: () =>
      import('./repositorios/repositorios.module').then((m) => m.RepositorioModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

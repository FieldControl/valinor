import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccessComponent } from './components/formAcessComponets/access/access.component';

const routes: Routes = [
  { path: 'acesso', component: AccessComponent },
  { path: '**', redirectTo: 'acesso'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListarComponent } from './listar/listar.component';
import { CadastroComponent } from './cadastro/cadastro.component';

const routes: Routes = [
  { path: 'cadastrar', component: CadastroComponent },
  { path: 'listar', component: ListarComponent },
  { path: '', redirectTo: '/listar', pathMatch: 'full' }, // Redirecionamento padrão
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
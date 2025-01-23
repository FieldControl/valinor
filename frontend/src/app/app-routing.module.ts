import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExcluirColunaComponent } from './componentes/excluir-coluna/excluir-coluna.component';
import { MuralComponent } from './componentes/mural/mural.component';
import { EditarColunaComponent } from './componentes/editar-coluna/editar-coluna.component';
import { EditarTarefaComponent } from './componentes/editar-tarefa/editar-tarefa.component'; 
import { ExcluirTarefaComponent } from './componentes/excluir-tarefa/excluir-tarefa.component';

const routes: Routes = [
  { path: 'componentes/excluirColuna/:id', component: ExcluirColunaComponent },
  { path: 'componentes/mural', component: MuralComponent },
  { path: 'componentes/editarColuna/:id', component: EditarColunaComponent },
  { path: 'componentes/editarTarefa/:id', component: EditarTarefaComponent },
  { path: 'componentes/excluirTarefa/:id', component: ExcluirTarefaComponent } 

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

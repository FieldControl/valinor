import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router'; // Importar RouterModule
import { AppComponent } from './app.component';
import { CabecalhoComponent } from './componentes/cabecalho/cabecalho.component';
import { ModalComponent } from './componentes/modal/modal/modal.component';
import { MainComponent } from './componentes/main/main/main.component';
import { ColumnComponent } from './componentes/column/column.component';
import { MuralComponent } from './componentes/mural/mural.component';
import { HttpClientModule } from '@angular/common/http';
import { ExcluirColunaComponent } from './componentes/excluir-coluna/excluir-coluna.component';
import { EditarColunaComponent } from './componentes/editar-coluna/editar-coluna.component';
import { EditarTarefaComponent } from './componentes/editar-tarefa/editar-tarefa.component';
import { ExcluirTarefaComponent } from './componentes/excluir-tarefa/excluir-tarefa.component';
import { TarefasComponent } from './componentes/tarefas/tarefas.component';
@NgModule({
  declarations: [
    AppComponent,
     // Adicionar TarefasComponent aqui
    CabecalhoComponent,
    ModalComponent,
    MainComponent,
    ColumnComponent,
    MuralComponent,
    ExcluirColunaComponent,
    EditarColunaComponent,
    EditarTarefaComponent,
    ExcluirTarefaComponent,
    TarefasComponent
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    RouterModule // Adicionar RouterModule aqui
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

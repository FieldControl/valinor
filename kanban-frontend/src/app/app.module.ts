import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { KanbanBoardComponent } from './components/kanban-board/kanban-board.component';

@NgModule({
  declarations: [
    AppComponent,        // Declaração do componente principal
    KanbanBoardComponent // Declaração do componente Kanban Board
  ],
  imports: [
    BrowserModule,       // Módulo básico para rodar a aplicação no navegador
    HttpClientModule,    // Para comunicação com APIs REST
    FormsModule          // Para gerenciar formulários e bindings
  ],
  providers: [],
  bootstrap: [AppComponent] // Componente inicial da aplicação
})
export class AppModule {}

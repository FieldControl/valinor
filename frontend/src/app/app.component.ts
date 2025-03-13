import { RouterOutlet } from '@angular/router';
import { Component, inject } from '@angular/core';
import { KanbanService } from './services/kanban.service';

import { HeaderComponent } from './components/header/header.component';
import { ColumnComponent } from './components/column/column.component';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, ColumnComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Frontend';
  columns: {
    id: number;
    title: string;
    cards: { id: number; title: string; description: string }[];
  }[] = [];

  private kanbanService = inject(KanbanService);

  //listening para quando eu inicilizar o componente 
  ngOnInit() {
    this.kanbanService.getColumns().subscribe(
      (response) => {
        console.log(
          'Colunas recebidas:',
          JSON.stringify(response.data.getColumns, null, 2)
        );
        this.columns = response.data.getColumns;
      },
      (error) => {
        console.error('Erro ao buscar colunas:', error);
      }
    );
  }

  //listening para quando eu adicionar uma coluna
  addColumn(newColumn: any) {
    this.columns = [...this.columns, newColumn]; 
  }
  //listening para quando eu deletar uma coluna
  removeColumn(columnId: number) {
    this.columns = this.columns.filter(col => col.id !== columnId);
  }
}

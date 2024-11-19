import { Component, OnInit } from '@angular/core';
import { KanbanService } from '../services/kanban.service';
import { Column } from '../models/column.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KanbanColumnComponent } from '../kanban-column/kanban-column.component';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, FormsModule, KanbanColumnComponent],
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.css'],
})
export class KanbanBoardComponent implements OnInit {
  columns: Column[] = [];
  newColumnName: string = '';

  constructor(private kanbanService: KanbanService) {}

  ngOnInit(): void {
    this.loadColumns();
  }

  // Carregar as colunas iniciais
  loadColumns(): void {
    this.kanbanService.getColumns().subscribe((columns) => {
      this.columns = columns;
    });
  }

  // Método para adicionar uma nova coluna
  addNewColumn(): void {
    const newColumn: Partial<Column> = {
      name: this.newColumnName,
      cards: [], // Pode adicionar cartões aqui, se necessário
    };

    console.log('Antes de adicionar coluna:', this.columns);

    this.kanbanService.addColumn(newColumn).subscribe({
      next: (createdColumn) => {
        console.log('Nova coluna criada:', createdColumn);
        this.columns.push(createdColumn); // Adiciona a coluna à lista
        console.log('Após adicionar coluna:', this.columns);
        this.newColumnName = ''; // Limpa o campo de entrada
      },
      error: (err) => {
        console.error('Erro ao adicionar coluna:', err);
      },
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { ColumnService } from './services/column.service';
import { WebsocketService } from './services/websocket.service';
import { KanbanColumn } from './models/kanban-column.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  columns: KanbanColumn[] = [];
  newColumnTitle: string = '';

  constructor(
    private columnService: ColumnService,
    private websocketService: WebsocketService
  ) {}

  ngOnInit(): void {
    this.getColumns();
    this.setupWebSocketListeners();
  }

  setupWebSocketListeners(): void {
    this.websocketService.onColumnCreated().subscribe((column: KanbanColumn) => {
      // Adiciona a coluna apenas se ela não estiver já presente
      if (!this.columns.find(col => col.id === column.id)) {
        this.columns.push(column);
      }
    });

    this.websocketService.onColumnEdited().subscribe((updatedColumn: KanbanColumn) => {
      const index = this.columns.findIndex(col => col.id === updatedColumn.id);
      if (index !== -1) this.columns[index] = updatedColumn;
    });

    this.websocketService.onColumnDeleted().subscribe((columnId: number) => {
      this.columns = this.columns.filter(column => column.id !== columnId);
    });
  }

  getColumns(): void {
    this.columnService.getColumns().subscribe((columns) => {
      this.columns = columns;
    });
  }

  addColumn(): void {
    if (!this.newColumnTitle.trim()) return;

    const newColumn: Partial<KanbanColumn> = {
      title: this.newColumnTitle,
      cards: []
    };

    // Cria a coluna no backend e envia um evento via WebSocket
    this.columnService.createColumn(newColumn).subscribe((column) => {
      this.columns.push(column);
      this.websocketService.createColumn(column); // Emite evento de criação
      this.newColumnTitle = ''; // Limpa o campo de título
    });
  }
}

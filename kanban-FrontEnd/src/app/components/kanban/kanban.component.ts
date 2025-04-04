import { Component, OnInit } from '@angular/core';
import { KanbanService } from '../../services/kanban.service';

interface Column {
  id: string;
  title: string;
}

@Component({
  selector: 'app-kanban',
  standalone: true,
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.css'],
})
export class KanbanComponent implements OnInit {
  columns: Column[] = []; //Lista de colunas

  constructor(private kanbanService: KanbanService) {}

  ngOnInit(): void {
    this.loadColumns();
  }

  /*
    Carrega as colunas do serviço KanbanService
  */
  loadColumns(): void {
    this.kanbanService.getColumns().subscribe({
      next: (data) => {
        this.columns = data; //Atualiza a lista de colunas
      },
      error: (err) => {
        console.error('Erro ao carregar colunas:', err);
      },
    });
  }
}

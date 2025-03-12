import { Component, EventEmitter, Output, inject } from '@angular/core';
import { KanbanService } from '../../services/kanban.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private kanbanService = inject(KanbanService);

  @Output() columnAdded = new EventEmitter<any>(); // Evento para notificar a criação de uma nova coluna

  addColumn() {
    const title = prompt('Digite o nome da nova coluna:');
    if (!title) return;

    this.kanbanService.createColumn(title).subscribe(
      (response) => {
        const newColumn = response.data.createColumn;
        this.columnAdded.emit({ ...newColumn, cards: [] }); // Envia a nova coluna para o componente pai
      },
      (error) => {
        console.error('Erro ao criar coluna:', error);
      }
    );
  }
}

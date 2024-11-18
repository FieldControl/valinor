import { Component, Input } from '@angular/core';
import { Column } from '../models/column.model';
import { Card } from '../models/card.model';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { KanbanCardComponent } from '../KanbanCard/kanban-card.component';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-kanban-column',
  standalone: true,
  templateUrl: './kanban-column.component.html',
  styleUrls: ['./kanban-column.component.css'],
  imports: [MatCardModule, CommonModule, KanbanCardComponent, HttpClientModule],
})
export class KanbanColumnComponent {
  @Input()
  column!: Column;

  // Função para adicionar um novo card
  onAddCard(): void {
    // Exemplo de um novo card - você pode customizar como preferir
    const newCard: Card = {
      id: Date.now(), // Use um identificador único, como timestamp
      title: 'Novo Card',
      description: 'Descrição do novo card',
    };

    // Adicione o novo card à lista de cards da coluna
    this.column.cards.push(newCard);
  }
}

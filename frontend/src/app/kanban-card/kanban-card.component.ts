import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from '../models/card.model';
import { KanbanService } from '../services/kanban.service';

@Component({
  selector: 'app-kanban-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kanban-card">
      <h3>{{ card.title }}</h3>
      <p>{{ card.description }}</p>
    </div>
  `,
  styles: [
    `
      .kanban-card {
        padding: 12px;
        margin-bottom: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: #fff;
      }
    `,
  ],
})
export class KanbanBoardComponent {
  columns: any[] = [];
  newCardTitle: string = '';
  newCardDescription: string = '';
  selectedColumnId: string = ''; // Para armazenar a coluna onde o novo card será adicionado
  card: any;

  constructor(private kanbanService: KanbanService) {}

  addNewCard(columnId: string): void {
    const newCard = {
      title: this.newCardTitle,
      description: this.newCardDescription,
      columnId: columnId,
    };

    this.kanbanService.addCard(newCard).subscribe(
      (createdCard) => {
        // Encontre a coluna correspondente e adicione o novo card
        const column = this.columns.find((col) => col.id === columnId);
        if (column) {
          column.cards.push(createdCard);
        }
        // Limpar os campos do formulário
        this.newCardTitle = '';
        this.newCardDescription = '';
      },
      (error) => {
        console.error('Erro ao adicionar card:', error);
      }
    );
  }
}

import { Component, Input } from '@angular/core';
import { Card } from './card.interface';
import { KanbanService } from '../kanban.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent {
  @Input() card!: Card;

  constructor(private kanbanService: KanbanService) {}

  updateCard(cardId: number, title: string, description: string): void {
    this.kanbanService.updateCard(cardId, title, description).subscribe((updatedCard) => {
      // Atualiza o card na interface
      // Você pode atualizar a lista de cards aqui ou apenas mostrar uma mensagem de sucesso
    }, (error) => {
      console.error('Erro ao atualizar o card:', error);
      // Trate o erro conforme necessário
    });
  }

  deleteCard(cardId: number): void {
    this.kanbanService.deleteCard(cardId).subscribe(() => {
      // Remove o card da interface
      // Você pode atualizar a lista de cards aqui ou apenas mostrar uma mensagem de sucesso
    }, (error) => {
      console.error('Erro ao excluir o card:', error);
      // Trate o erro conforme necessário
    });
  }
}

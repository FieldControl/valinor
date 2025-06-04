import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BoardColumn } from '../../models/column.model';
import { CommonModule } from '@angular/common';
import { Card } from '../../models/card.model';
import { CardService } from '../../services/card.service';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-column',
  standalone: true,
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.css'],
  imports: [FormsModule,CardComponent,CommonModule]
})
export class ColumnComponent {
  @Input() column!: BoardColumn;
  @Output() columnDeleted = new EventEmitter<number>();
  @Output() newCardAdded = new EventEmitter<{ newCard: Card; columnId: number }>();
  @Output() cardDeleted = new EventEmitter<number>();
  @Output() cardDropped = new EventEmitter<{ card: Card, targetColumnId: number }>();

  newCardTitle: string = '';
  showAddCardForm: boolean = false;

  constructor(private cardService: CardService) {}

  deleteColumn(): void {
    if (confirm('Tem certeza que deseja excluir esta coluna?')) {
      this.columnDeleted.emit(this.column.id);
    }
  }

  toggleAddCardForm(): void {
    this.showAddCardForm = !this.showAddCardForm;
  }

  createCard(): void {
  if (this.newCardTitle.trim()) {
    const newCard: Omit<Card, 'id'> = {
      title: this.newCardTitle,
      description: '',
      columnId: this.column.id
    };

    this.cardService.createCard(newCard).subscribe(
      (card) => {
        this.newCardTitle = '';
        this.showAddCardForm = false;
        this.newCardAdded.emit({ newCard: card, columnId: this.column.id });
      },
      (error) => {
        console.error('Erro ao criar card:', error);
      }
    );
  }
}

  onCardDeleted(cardId: number): void {
    this.column.cards = this.column.cards.filter(card => card.id !== cardId);
    this.cardDeleted.emit(cardId);
  }

  onDrop(card: Card, targetColumnId: number) {
    this.cardDropped.emit({ card, targetColumnId });
    confirm(`card teste: ${card.title}`);
  }

  //Adicionei os eventos que faltavam

  allowDrop(event: DragEvent) {
    event.preventDefault();
  }

  drag(event: DragEvent, card: Card) {
    event.dataTransfer?.setData('cardId', card.id.toString());
    event.dataTransfer?.setData('sourceColumnId', this.column.id.toString());
  }

  onDragDrop(event: DragEvent) {
    event.preventDefault();

    const cardIdStr = event.dataTransfer?.getData('cardId');
    const sourceColumnIdStr = event.dataTransfer?.getData('sourceColumnId');

    if (!cardIdStr || !sourceColumnIdStr) return;

    const cardId = parseInt(cardIdStr, 10);
    const sourceColumnId = parseInt(sourceColumnIdStr, 10);

    if (sourceColumnId === this.column.id) return; // Não mover para a mesma coluna

    this.cardDropped.emit({ card: { id: cardId } as Card, targetColumnId: this.column.id });
  }

  trackByCardId(index: number, card: Card): number {
    return card.id;
  }
  
}
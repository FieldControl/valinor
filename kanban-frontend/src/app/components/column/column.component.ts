import { Component, OnInit, Input } from '@angular/core';
import { ColumnService } from '../../services/column.service';
import { CardService } from '../../services/card.service';
import { WebsocketService } from '../../services/websocket.service';
import { KanbanColumn } from '../../models/kanban-column.model';
import { Card } from '../../models/card.model';

@Component({
  selector: 'app-column',
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.css']
})
export class ColumnComponent implements OnInit {
  @Input() column!: KanbanColumn;
  newCardTitle: string = '';
  newCardDescription: string = '';
  isEditingTitle: boolean = false;
  editableTitle: string = '';

  constructor(
    private columnService: ColumnService,
    private cardService: CardService,
    private websocketService: WebsocketService
  ) {}

  ngOnInit(): void {
    this.editableTitle = this.column.title;
    this.setupWebSocketListeners();
  }

  setupWebSocketListeners(): void {
    // Listener para criação de cartões
    this.websocketService.onCardCreated().subscribe((card: Card) => {
      if (card.column.id === this.column.id) {
        // Verifica se o cartão já existe para evitar duplicação
        if (!this.column.cards.find(c => c.id === card.id)) {
          this.column.cards.push(card);
        }
      }
    });

    // Listener para edição de cartões
    this.websocketService.onCardEdited().subscribe((updatedCard: Card) => {
      const index = this.column.cards.findIndex(c => c.id === updatedCard.id);
      if (index !== -1) this.column.cards[index] = updatedCard;
    });

    // Listener para exclusão de cartões
    this.websocketService.onCardDeleted().subscribe((cardId: number) => {
      this.column.cards = this.column.cards.filter(card => card.id !== cardId);
    });
  }

  addCard(): void {
    if (!this.newCardTitle.trim() || !this.newCardDescription.trim()) return;

    const newCard: Partial<Card> = {
      title: this.newCardTitle,
      description: this.newCardDescription,
      column: { id: this.column.id }
    };

    // Cria o cartão no backend e emite o evento WebSocket
    this.cardService.createCard(newCard).subscribe((card) => {
      this.column.cards.push(card); // Adiciona o cartão localmente
      this.websocketService.createCard(card); // Emite o evento WebSocket
      this.newCardTitle = '';
      this.newCardDescription = '';
    });
  }

  toggleEditTitle(): void {
    this.isEditingTitle = !this.isEditingTitle;
    if (!this.isEditingTitle) {
      this.saveTitle();
    }
  }

  saveTitle(): void {
    if (this.editableTitle.trim() && this.editableTitle !== this.column.title) {
      this.columnService.updateColumn(this.column.id, { title: this.editableTitle }).subscribe(() => {
        this.column.title = this.editableTitle;
        this.websocketService.editColumn({ id: this.column.id, title: this.editableTitle });
      });
    }
  }

  deleteColumn(): void {
    this.columnService.deleteColumn(this.column.id).subscribe(() => {
      this.websocketService.deleteColumn(this.column.id);
    });
  }
}

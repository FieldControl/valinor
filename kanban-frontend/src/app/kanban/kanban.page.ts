import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Card } from './models/card.model';
import { KanbanService } from './services/kanban.service';

interface Column {
  id: number;
  title: string;
}


@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.page.html',
  styleUrls: ['./kanban.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, DragDropModule],
})
export class KanbanPage implements OnInit {
  columns: Column[] = [
    { id: 1, title: 'To Do' },
    { id: 2, title: 'In Progress' },
    { id: 3, title: 'Done' },
  ];
  connectedDropLists: string[] = [];
  cards: { [key: number]: Card[] } = {};
  loading = true;
  error: any;

  constructor(
    private kanbanService: KanbanService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.columns.forEach((column) => {
      this.cards[column.id] = [];
    });

    this.connectedDropLists = this.columns.map((c) => `columnDropList-${c.id}`);
    this.loadCards();
  }

  loadCards() {
    this.loading = true;
    this.error = null;
    let completed = 0;

    this.columns.forEach((column) => {
      this.kanbanService.getCardsByColumnId(column.id).subscribe({
        next: (cards) => {
          this.cards[column.id] = cards;
          completed++;
          if (completed === this.columns.length) {
            this.loading = false;
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          console.error(`Erro ao carregar cards da coluna ${column.id}:`, err);
          this.error = err;
          this.cards[column.id] = [];
          completed++;
          if (completed === this.columns.length) {
            this.loading = false;
            this.cdr.detectChanges();
          }
        },
      });
    });
  }

  onCardDrop(event: CdkDragDrop<Card[]>, targetColumnId: number) {
    const prevColumnId = +event.previousContainer.id.split('-').pop()!;
    const movedCard = { ...event.previousContainer.data[event.previousIndex] };

    const newCards = { ...this.cards };
    newCards[prevColumnId] = [...(newCards[prevColumnId] || [])];
    newCards[targetColumnId] = [...(newCards[targetColumnId] || [])];

    if (event.previousContainer === event.container) {
      moveItemInArray(newCards[targetColumnId], event.previousIndex, event.currentIndex);
      this.cards = { ...newCards };
      this.cdr.detectChanges();
      this.loadCards();
    } else {
      transferArrayItem(
        newCards[prevColumnId],
        newCards[targetColumnId],
        event.previousIndex,
        event.currentIndex
      );

      this.cards = { ...newCards };
      this.cdr.detectChanges();

      this.kanbanService.updateCardColumn(movedCard.id, targetColumnId).subscribe({
        next: () => {
          this.loadCards();
        },
        error: (err) => {
          console.error('Erro ao atualizar card no banco:', err);
          const revertCards = { ...this.cards };
          transferArrayItem(
            revertCards[targetColumnId],
            revertCards[prevColumnId],
            event.currentIndex,
            event.previousIndex
          );
          this.cards = { ...revertCards };
          this.cdr.detectChanges();
          this.loadCards();
        },
      });
    }
  }

  deleteCard(card: Card, columnId: number) {
    const newCards = { ...this.cards };
    newCards[columnId] = newCards[columnId].filter(c => c.id !== card.id);
    this.cards = { ...newCards };
    this.cdr.detectChanges();

    this.kanbanService.deleteCard(card.id).subscribe({
      next: () => {
        this.loadCards();
      },
      error: (err) => {
        console.error('Erro ao deletar card no banco:', err);
        this.loadCards();
      },
    });
  }
}

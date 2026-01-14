import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Column } from '../../core/models/column.model';
import { Card } from '../../core/models/card.model';
import { KanbanApiService } from '../../core/services/kanban-api.service';
import { CreateCardDialogComponent } from '../../shared/create-card-dialog/create-card-dialog.component';
import { KanbanCardComponent } from '../kanban-card/kanban-card.component';
import { EditColumnDialogComponent } from '../../shared/edit-column-dialog/edit-column-dialog.component';
import { EditCardDialogComponent } from '../../shared/edit-card-dialog/edit-card-dialog.component';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';


// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-kanban-column',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    KanbanCardComponent,
    DragDropModule,

    // Material
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: './kanban-column.component.html',
  styleUrl: './kanban-column.component.scss'
})
export class KanbanColumnComponent {
  @Input() column!: Column;
  @Input() dropListId!: string;
  @Input() connectedDropLists: string[] = [];
  @Output() columnDeleted = new EventEmitter<string>();

  newCardTitle = '';
  newCardDescription = '';
  newCardDueDate = '';

  error: string | null = null;

  constructor(
    private kanbanApi: KanbanApiService,
    private dialog: MatDialog
  ) { }

  trackByCardId(_index: number, card: Card): string {
    return card.id;
  }

  onCardDrop(event: CdkDragDrop<Card[]>): void {
    const prevCards = event.previousContainer.data as Card[];
    const currCards = event.container.data as Card[];

    // mesmo container → só reordena
    if (event.previousContainer === event.container) {
      moveItemInArray(currCards, event.previousIndex, event.currentIndex);
      this.persistCardsOrder(currCards);
    } else {
      // mudou de coluna
      transferArrayItem(
        prevCards,
        currCards,
        event.previousIndex,
        event.currentIndex,
      );

      const movedCard = currCards[event.currentIndex];
      // atualiza columnId em memória
      movedCard.columnId = this.column.id;

      this.persistCardsOrder(prevCards);  // coluna antiga
      this.persistCardsOrder(currCards);  // coluna nova
    }
  }

  private persistCardsOrder(cards: Card[]): void {
    cards.forEach((card, index) => {
      this.kanbanApi
        .updateCard(card.id, {
          order: index,
          columnId: card.columnId,
        })
        .subscribe({
          error: () => {
            // se quiser, pode setar uma mensagem ou recarregar board
            this.error = 'Erro ao reordenar cards.';
          },
        });
    });
  }

  createCard(): void {
    const title = this.newCardTitle.trim();
    const description = this.newCardDescription.trim();
    const dueDate = this.newCardDueDate.trim();

    if (!title) return;

    this.kanbanApi
      .createCard(this.column.id, {
        title,
        description: description || undefined,
        dueDate: dueDate || undefined,
      })
      .subscribe({
        next: (card) => {
          this.column.cards.push(card);
          this.newCardTitle = '';
          this.newCardDescription = '';
          this.newCardDueDate = '';
          this.error = null;
        },
        error: () => {
          this.error = 'Erro ao criar card.';
        },
      });
  }

  openCreateCardDialog(): void {
    const dialogRef = this.dialog.open(CreateCardDialogComponent, {
      panelClass: 'app-dialog',
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      this.kanbanApi
        .createCard(this.column.id, result)
        .subscribe({
          next: (card) => {
            const currentCards = this.column.cards ?? [];

            this.column = {
              ...this.column,
              cards: [...this.column.cards, card],
            };
            this.error = null;
          },
          error: () => {
            this.error = 'Erro ao criar card.';
          },
        });
    });
  }

  openCardDialog(card: Card): void {
    const dueDate = card.dueDate ? card.dueDate.substring(0, 16) : '';

    const dialogRef = this.dialog.open(EditCardDialogComponent, {
      panelClass: 'app-dialog',
      width: '400px',
      data: {
        title: card.title,
        description: card.description ?? '',
        dueDate,
        readonly: true,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const payload = {
        title: result.title,
        description: result.description ?? undefined,
        dueDate: result.dueDate
          ? new Date(result.dueDate).toISOString()
          : undefined,
      };

      this.kanbanApi.updateCard(card.id, payload).subscribe({
        next: () => {
          card.title = payload.title!;
          card.description = payload.description ?? null;
          card.dueDate = payload.dueDate ?? null;
          this.error = null;
        },
        error: () => {
          this.error = 'Erro ao atualizar card.';
        },
      });
    });
  }

  deleteCard(card: Card): void {
    this.kanbanApi.deleteCard(card.id).subscribe({
      next: () => {
        this.column.cards = this.column.cards.filter((c) => c.id !== card.id);
        this.error = null;
      },
      error: () => {
        this.error = 'Erro ao remover card.';
      },
    });
  }

  editColumn(): void {
    const dialogRef = this.dialog.open(EditColumnDialogComponent, {
      panelClass: 'app-dialog',
      width: '400px',
      data: { title: this.column.title },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      this.kanbanApi
        .updateColumn(this.column.id, { title: result.title })
        .subscribe({
          next: (updated) => {
            this.error = null;
            this.column.title = updated.title;
          },
          error: () => {
            this.error = 'Erro ao renomear coluna.';
          },
        });
    });
  }

  deleteColumn(): void {
    this.kanbanApi.deleteColumn(this.column.id).subscribe({
      next: () => {
        this.error = null;
        this.columnDeleted.emit(this.column.id);
      },
      error: () => {
        this.error = 'Erro ao remover coluna.';
      },
    });
  }

}

import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import {
  CardModel,
  ColumnModel,
  CreateCardDto,
  KanbanService,
  ReorderCardDto,
} from '../../../services/kanban.service';
import { WebsocketService } from '../../../services/websocket.service';
import { CreateCardDialog } from '../../../shared/card/create-card-dialog/create-card-dialog';
import { ConfirmDeleteColumnDialog } from '../../../shared/column/confirm-delete-column-dialog/confirm-delete-column-dialog';
import { UpdateColumnDialog } from '../../../shared/column/update-column-dialog/update-column-dialog';
import { Card } from '../card/card';
import { finalize } from 'rxjs';
import { Spinner } from '../../../shared/spinner/spinner';

@Component({
  selector: 'board-column',
  templateUrl: './column.html',
  styleUrl: './column.css',
  imports: [CdkDropList, CdkDrag, MatButtonModule, MatIcon, Card, Spinner],
})
export class Column implements OnInit {
  protected readonly columns = signal<ColumnModel[]>([]);
  protected readonly isLoading = signal<boolean>(false);
  private kanbanService = inject(KanbanService);
  private socketService = inject(WebsocketService);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.initBoard();

    const reloadEvents = [
      'column.created',
      'column.updated',
      'column.reordered',
      'column.deleted',
      'card.created',
      'card.updated',
      'card.reordered',
      'card.deleted',
    ];

    reloadEvents.forEach((event) => {
      this.socketService
        .on<any>(event)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.initBoard(false);
        });
    });
  }

  private initBoard(showLoading: boolean = true) {
    if (showLoading) this.isLoading.set(true);
    this.kanbanService
      .getColumnsWithCards()
      .pipe(
        finalize(() => {
          if (showLoading) this.isLoading.set(false);
        })
      )
      .subscribe((columnsFetch) => {
        const columnsWithCards = columnsFetch.map((col) => ({
          ...col,
          cards: col.cards || [],
        }));
        this.columns.set(columnsWithCards);
      });
  }

  protected readonly connectedLists = computed(() =>
    this.columns().map((col) => `column-${col.id}`)
  );

  dropColumn(event: CdkDragDrop<ColumnModel[]>) {
    const cols = [...this.columns()];
    moveItemInArray(cols, event.previousIndex, event.currentIndex);

    this.columns.set(cols);

    this.kanbanService
      .reorderColumn(
        cols.map((col, index) => ({
          id: col.id,
          position: index,
        }))
      )
      .subscribe();
  }

  dropCard(event: CdkDragDrop<CardModel[]>, targetColumnId: number) {
    if (event.previousContainer === event.container) {
      // MOVIMENTO DENTRO DA MESMA COLUNA
      const cards = [...event.container.data];

      moveItemInArray(cards, event.previousIndex, event.currentIndex);

      this.columns.update((cols) =>
        cols.map((col) => (col.id === targetColumnId ? { ...col, cards } : col))
      );

      this.kanbanService
        .reorderCard(
          cards.map((card, index) => ({
            id: card.id,
            position: index,
          }))
        )
        .subscribe();
    } else {
      // MOVIMENTO ENTRE COLUNAS
      const sourceCards = [...event.previousContainer.data];
      const targetCards = [...event.container.data];

      transferArrayItem(sourceCards, targetCards, event.previousIndex, event.currentIndex);

      const sourceColumnId = +event.previousContainer.id.replace('column-', '');

      this.columns.update((cols) =>
        cols.map((col) => {
          if (col.id === targetColumnId) {
            return { ...col, cards: targetCards };
          }
          if (col.id === sourceColumnId) {
            return { ...col, cards: sourceCards };
          }
          return col;
        })
      );

      const cardsToUpdate: ReorderCardDto[] = [
        ...sourceCards.map((card, index) => ({
          id: card.id,
          position: index,
        })),
        ...targetCards.map((card, index) => ({
          id: card.id,
          position: index,
          columnId: targetColumnId,
        })),
      ];

      this.kanbanService.reorderCard(cardsToUpdate).subscribe();
    }
  }

  openUpdateColumnDialog(column: ColumnModel) {
    const dialogRef = this.dialog.open(UpdateColumnDialog, {
      width: '450px',
      disableClose: false,
      data: {
        column,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.kanbanService.updateColumn(result).subscribe();
      }
    });
  }

  openDeleteColumnDialog(column: ColumnModel) {
    const dialogRef = this.dialog.open(ConfirmDeleteColumnDialog, {
      width: '350px',
      disableClose: false,
      data: {
        columnName: column.name,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.kanbanService.deleteColumn(column.id).subscribe();
      }
    });
  }

  openCreateCardDialog(columnId: number) {
    const dialogRef = this.dialog.open(CreateCardDialog, {
      width: '450px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result: { name: string; description?: string }) => {
      if (!result) return;

      const card: CreateCardDto = {
        name: result.name,
        description: result.description ?? '',
        columnId,
      };

      this.kanbanService.createCard(card).subscribe();
    });
  }
}

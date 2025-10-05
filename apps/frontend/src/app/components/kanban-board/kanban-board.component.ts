import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { KanbanService } from '../../services/kanban.service';
import { Column, Card } from '../../models';
import { KanbanHeaderComponent } from '../kanban-header/kanban-header.component';
import { AddColumnDialogComponent } from '../add-column-dialog/add-column-dialog.component';
import { AddCardFormComponent } from '../add-card-form/add-card-form.component';
import { DeleteConfirmationModalComponent } from '../delete-confirmation-modal/delete-confirmation-modal.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    KanbanHeaderComponent,
    AddColumnDialogComponent,
    AddCardFormComponent,
    DeleteConfirmationModalComponent,
  ],
  template: `
    <div class="min-h-screen bg-gray-100 p-6">
      <app-kanban-header></app-kanban-header>

      <div *ngIf="loading" class="flex justify-center items-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
        ></div>
      </div>

      <div
        *ngIf="error"
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
      >
        <strong>Erro:</strong> {{ error }}
      </div>

      <div *ngIf="!loading && !error" class="mb-6">
        <button
          (click)="openAddColumnDialog()"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            ></path>
          </svg>
          Adicionar Coluna
        </button>
      </div>

      <div
        *ngIf="!loading && !error"
        cdkDropList
        id="columns-container"
        [cdkDropListData]="columns"
        (cdkDropListDropped)="onColumnDrop($event)"
        cdkDropListOrientation="horizontal"
        class="flex gap-6 overflow-x-auto pb-4"
      >
        <div
          *ngFor="let column of columns; trackBy: trackByColumnId"
          cdkDrag
          [cdkDragData]="column"
          class="min-w-[300px] bg-white rounded-lg shadow-sm cursor-move"
        >
          <div class="p-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div
                  class="w-3 h-3 rounded-full"
                  [style.background-color]="column.color"
                ></div>
                <h3 class="font-semibold text-gray-900">{{ column.title }}</h3>
                <span
                  class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                >
                  {{ column.cards.length }}
                </span>
              </div>
              <button
                (click)="onColumnDelete(column.id)"
                class="text-gray-400 hover:text-red-500 transition-colors"
                title="Deletar coluna"
              >
                🗑️
              </button>
            </div>
            <p *ngIf="column.description" class="text-sm text-gray-600 mt-1">
              {{ column.description }}
            </p>
          </div>

          <div
            cdkDropList
            [id]="'column-' + column.id"
            [cdkDropListData]="column.cards"
            [cdkDropListConnectedTo]="getConnectedDropLists()"
            (cdkDropListDropped)="onCardDrop($event, column.id)"
            class="p-4 space-y-3 min-h-[200px]"
          >
            <div
              *ngFor="let card of column.cards; trackBy: trackByCardId"
              cdkDrag
              [cdkDragData]="card"
              class="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-move"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900 mb-1">
                    {{ card.title }}
                  </h4>
                  <p
                    *ngIf="card.description"
                    class="text-sm text-gray-600 mb-2"
                  >
                    {{ card.description }}
                  </p>
                  <span
                    class="text-xs px-2 py-1 rounded-full"
                    [class]="getPriorityClass(card.priority)"
                  >
                    {{ card.priority }}
                  </span>
                </div>
                <button
                  (click)="onCardDelete(card.id)"
                  class="text-gray-400 hover:text-red-500 transition-colors text-xs ml-2"
                  title="Deletar card"
                >
                  🗑️
                </button>
              </div>
            </div>

            <button
              (click)="toggleAddCardForm(column.id)"
              class="w-full h-12 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <span class="text-gray-500">+ Adicionar Card</span>
            </button>

            <app-add-card-form
              *ngIf="showAddCardForm[column.id]"
              [loading]="addingCard"
              (cardSubmit)="onCardSubmit($event, column.id)"
              (formCancel)="onCardFormCancel(column.id)"
            ></app-add-card-form>
          </div>
        </div>
      </div>

      <app-add-column-dialog
        [isOpen]="showAddColumnDialog"
        [loading]="addingColumn"
        (columnSubmit)="onColumnSubmit($event)"
        (dialogCancel)="onColumnDialogCancel()"
      ></app-add-column-dialog>

      <app-delete-confirmation-modal
        [isOpen]="showDeleteModal"
        [title]="deleteModalTitle"
        [message]="deleteModalMessage"
        [loading]="deleting"
        (confirm)="onDeleteConfirm()"
        (cancelEvent)="onDeleteCancel()"
      ></app-delete-confirmation-modal>
    </div>
  `,
  styles: [],
})
export class KanbanBoardComponent implements OnInit, OnDestroy {
  columns: Column[] = [];
  loading = true;
  error: string | null = null;
  addingColumn = false;
  addingCard = false;
  showAddCardForm: { [columnId: number]: boolean } = {};

  showAddColumnDialog = false;
  showDeleteModal = false;
  deleteModalTitle = '';
  deleteModalMessage = '';
  deleting = false;
  deleteType: 'column' | 'card' | null = null;
  deleteId: number | null = null;

  private destroy$ = new Subject<void>();

  constructor(private kanbanService: KanbanService) {}

  ngOnInit(): void {
    this.loadColumns();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadColumns(): void {
    this.loading = true;
    this.error = null;

    this.kanbanService
      .getColumns()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (columns) => {
          this.columns = columns;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Erro ao carregar colunas: ' + error.message;
          this.loading = false;
        },
      });
  }

  onColumnSubmit(columnData: {
    title: string;
    description: string;
    color: string;
  }): void {
    this.addingColumn = true;
    this.kanbanService
      .createColumn(columnData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.addingColumn = false;
          this.showAddColumnDialog = false;
          this.loadColumns();
        },
        error: (error) => {
          this.error = 'Erro ao criar coluna: ' + error.message;
          this.addingColumn = false;
        },
      });
  }

  openAddColumnDialog(): void {
    this.showAddColumnDialog = true;
  }

  onColumnDialogCancel(): void {
    this.showAddColumnDialog = false;
  }

  onColumnDelete(columnId: number): void {
    const column = this.columns.find((c) => c.id === columnId);
    this.deleteType = 'column';
    this.deleteId = columnId;
    this.deleteModalTitle = 'Deletar Coluna';
    this.deleteModalMessage = `Tem certeza que deseja deletar a coluna "${column?.title}"? Todos os cards desta coluna também serão deletados.`;
    this.showDeleteModal = true;
  }

  onCardSubmit(
    cardData: {
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
    },
    columnId: number
  ): void {
    this.addingCard = true;
    this.kanbanService
      .createCard({
        title: cardData.title,
        description: cardData.description,
        priority: cardData.priority,
        columnId: columnId,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.addingCard = false;
          this.showAddCardForm[columnId] = false;
          this.loadColumns();
        },
        error: (error) => {
          this.error = 'Erro ao criar card: ' + error.message;
          this.addingCard = false;
        },
      });
  }

  onCardDelete(cardId: number): void {
    const card = this.columns
      .flatMap((c) => c.cards)
      .find((c) => c.id === cardId);
    this.deleteType = 'card';
    this.deleteId = cardId;
    this.deleteModalTitle = 'Deletar Card';
    this.deleteModalMessage = `Tem certeza que deseja deletar o card "${card?.title}"?`;
    this.showDeleteModal = true;
  }

  onDeleteConfirm(): void {
    if (!this.deleteType || !this.deleteId) return;

    this.deleting = true;

    if (this.deleteType === 'column') {
      this.kanbanService
        .deleteColumn(this.deleteId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.deleting = false;
            this.showDeleteModal = false;
            this.loadColumns();
          },
          error: (error) => {
            this.deleting = false;
            this.error = 'Erro ao deletar coluna: ' + error.message;
          },
        });
    } else if (this.deleteType === 'card') {
      this.kanbanService
        .deleteCard(this.deleteId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.deleting = false;
            this.showDeleteModal = false;
            this.loadColumns();
          },
          error: (error) => {
            this.deleting = false;
            this.error = 'Erro ao deletar card: ' + error.message;
          },
        });
    }
  }

  onDeleteCancel(): void {
    this.showDeleteModal = false;
    this.deleteType = null;
    this.deleteId = null;
    this.deleteModalTitle = '';
    this.deleteModalMessage = '';
  }

  getConnectedDropLists(): string[] {
    return this.columns.map((column) => 'column-' + column.id);
  }

  onColumnDrop(event: CdkDragDrop<Column[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(this.columns, event.previousIndex, event.currentIndex);

      const columnUpdates = this.columns.map((column, index) => ({
        id: column.id,
        position: index,
      }));

      this.kanbanService
        .updateColumnPositions(columnUpdates)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadColumns();
          },
          error: (error) => {
            this.error =
              'Erro ao atualizar posições das colunas: ' + error.message;
            this.loadColumns();
          },
        });
    }
  }

  onCardDrop(event: CdkDragDrop<Card[]>, targetColumnId: number): void {
    if (event.previousContainer === event.container) {
      if (event.previousIndex !== event.currentIndex) {
        moveItemInArray(
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
        this.moveCardWithinColumn(event);
      }
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.moveCardBetweenColumns(event, targetColumnId);
    }
  }

  private moveCardWithinColumn(event: CdkDragDrop<Card[]>): void {
    const cards = event.container.data;
    const cardUpdates = cards.map((card, index) => ({
      id: card.id,
      position: index,
    }));

    this.kanbanService
      .updateCardPositions(cardUpdates)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Success - no action needed
        },
        error: (error) => {
          this.error = 'Erro ao atualizar posições: ' + error.message;
          this.loadColumns();
        },
      });
  }

  private moveCardBetweenColumns(
    event: CdkDragDrop<Card[]>,
    targetColumnId: number
  ): void {
    const card = event.item.data;

    this.kanbanService
      .moveCard(card.id, {
        columnId: targetColumnId,
        position: event.currentIndex,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Success - no action needed
        },
        error: (error) => {
          this.error = 'Erro ao mover card: ' + error.message;
          this.loadColumns();
        },
      });
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  onCardFormCancel(columnId: number): void {
    this.showAddCardForm[columnId] = false;
  }

  toggleAddCardForm(columnId: number): void {
    this.showAddCardForm[columnId] = !this.showAddCardForm[columnId];
  }

  trackByColumnId(index: number, column: Column): number {
    return column.id;
  }

  trackByCardId(index: number, card: Card): number {
    return card.id;
  }
}

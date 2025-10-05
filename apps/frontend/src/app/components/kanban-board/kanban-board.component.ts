// Angular Core
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
// Services
import { KanbanService } from '../../services/kanban.service';
// Models
import { Column, Card } from '../../models';
// Components
import { KanbanHeaderComponent } from '../kanban-header/kanban-header.component';
import { AddColumnFormComponent } from '../add-column-form/add-column-form.component';
import { KanbanColumnComponent } from '../kanban-column/kanban-column.component';
import { DeleteConfirmationModalComponent } from '../delete-confirmation-modal/delete-confirmation-modal.component';
// RxJS
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [
    CommonModule,
    KanbanHeaderComponent,
    AddColumnFormComponent,
    KanbanColumnComponent,
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

      <div *ngIf="!loading && !error" class="flex gap-6 overflow-x-auto pb-4">
        <app-add-column-form
          [loading]="addingColumn"
          (columnSubmit)="onColumnSubmit($event)"
          (formCancel)="onColumnFormCancel()"
        ></app-add-column-form>

        <app-kanban-column
          *ngFor="let column of columns; trackBy: trackByColumnId"
          [column]="column"
          [addingCard]="addingCard"
          (columnDelete)="onColumnDelete($event)"
          (cardSubmit)="onCardSubmit($event)"
          (cardDelete)="onCardDelete($event)"
        ></app-kanban-column>
      </div>

      <app-delete-confirmation-modal
        [isOpen]="showDeleteModal"
        [title]="deleteModalTitle"
        [message]="deleteModalMessage"
        [loading]="deleting"
        (confirm)="onDeleteConfirm()"
        (cancel)="onDeleteCancel()"
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

  // Delete modal properties
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
          this.loadColumns();
        },
        error: (error) => {
          this.error = 'Erro ao criar coluna: ' + error.message;
          this.addingColumn = false;
        },
      });
  }

  onColumnFormCancel(): void {}

  onColumnDelete(columnId: number): void {
    const column = this.columns.find((c) => c.id === columnId);
    this.deleteType = 'column';
    this.deleteId = columnId;
    this.deleteModalTitle = 'Deletar Coluna';
    this.deleteModalMessage = `Tem certeza que deseja deletar a coluna "${column?.title}"? Todos os cards desta coluna também serão deletados.`;
    this.showDeleteModal = true;
  }

  onCardSubmit(data: {
    columnId: number;
    card: {
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
    };
  }): void {
    this.addingCard = true;
    this.kanbanService
      .createCard({
        ...data.card,
        columnId: data.columnId,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.addingCard = false;
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

  trackByColumnId(index: number, column: Column): number {
    return column.id;
  }
}

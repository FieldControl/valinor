import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { KanbanApiService } from '../../core/services/kanban-api.service';
import { Board } from '../../core/models/board.model';
import { Column } from '../../core/models/column.model';
import { CreateColumnDialogComponent } from '../../shared/create-column-dialog/create-column-dialog.component';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { KanbanColumnComponent } from '../kanban-column/kanban-column.component';

@Component({
  selector: 'app-board-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    KanbanColumnComponent,
    
    // Material
    MatToolbarModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  templateUrl: './board-detail.component.html',
})
export class BoardDetailComponent implements OnInit {
  board: Board | null = null;
  loading = false;
  error: string | null = null;

  newColumnTitle = '';
  newCardTitleByColumn: Record<string, string> = {};
  newCardDescriptionByColumn: Record<string, string> = {};
  newCardDueDateByColumn: Record<string, string> = {};

  private boardId!: string;

  constructor(
    private route: ActivatedRoute,
    private kanbanApi: KanbanApiService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.boardId = this.route.snapshot.paramMap.get('id') as string;
    this.loadBoard();
  }

  loadBoard(): void {
    this.loading = true;
    this.error = null;

    this.kanbanApi.getBoardById(this.boardId).subscribe({
      next: (board) => {
        this.board = board;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar o quadro.';
        this.loading = false;
      },
    });
  }

  createColumn(): void {
    if (!this.newColumnTitle.trim()) return;

    this.kanbanApi
      .createColumn(this.boardId, { title: this.newColumnTitle.trim() })
      .subscribe({
        next: () => {
          this.newColumnTitle = '';
          this.loadBoard();
        },
        error: () => {
          this.error = 'Erro ao criar coluna.';
        },
      });
  }

  createCard(column: Column): void {
    const title = (this.newCardTitleByColumn[column.id] || '').trim();
    const description = (this.newCardDescriptionByColumn[column.id] || '')
      .trim();
    const dueDate = (this.newCardDueDateByColumn[column.id] || '').trim();

    if (!title) return;

    this.kanbanApi
      .createCard(column.id, {
        title,
        description: description || undefined,
        dueDate: dueDate || undefined,
      })
      .subscribe({
        next: () => {
          this.newCardTitleByColumn[column.id] = '';
          this.newCardDescriptionByColumn[column.id] = '';
          this.newCardDueDateByColumn[column.id] = '';
          this.loadBoard();
        },
        error: () => {
          this.error = 'Erro ao criar card.';
        },
      });
  }

  trackByColumnId(_index: number, column: Column): string {
    return column.id;
  }

  openCreateColumnDialog(): void {
    const dialogRef = this.dialog.open(CreateColumnDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      this.kanbanApi
        .createColumn(this.boardId, { title: result.title })
        .subscribe({
          next: () => this.loadBoard(),
          error: () => {
            this.error = 'Erro ao criar coluna.';
          },
        });
    });
  }

}

import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { KanbanApiService } from '../../core/services/kanban-api.service';
import { Board } from '../../core/models/board.model';
import { Column } from '../../core/models/column.model';
import { CreateColumnDialogComponent } from '../../shared/create-column-dialog/create-column-dialog.component';
import { EditBoardDialogComponent } from '../../shared/edit-board-dialog/edit-board-dialog.component';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';


// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { KanbanColumnComponent } from '../kanban-column/kanban-column.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-board-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    KanbanColumnComponent,
    DragDropModule,

    // Material
    MatToolbarModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: './board-detail.component.html',
  styleUrl: './board-detail.component.scss'

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
    private dialog: MatDialog,
    private location: Location
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

  goBack(): void {
    this.location.back();
  }

  trackByColumnId(_index: number, column: Column): string {
    return column.id;
  }

  onColumnDrop(event: CdkDragDrop<Column[]>): void {
    if (!this.board) return;

    const columns = this.board.columns;
    moveItemInArray(columns, event.previousIndex, event.currentIndex);

    columns.forEach((col, index) => {
      this.kanbanApi.updateColumn(col.id, { order: index }).subscribe({
        error: () => {
          this.loadBoard();
        },
      });
    });
  }

  getCardDropListId(columnId: string): string {
    return `cards-${columnId}`;
  }

  get cardDropListIds(): string[] {
    return this.board?.columns.map((c) => this.getCardDropListId(c.id)) ?? [];
  }


  createColumn(): void {
    if (!this.newColumnTitle.trim()) return;

    this.kanbanApi
      .createColumn(this.boardId, { title: this.newColumnTitle.trim() })
      .subscribe({
        next: (column) => {
          this.newColumnTitle = '';
          this.board!.columns.push(column);
        },
        error: () => {
          this.error = 'Erro ao criar coluna.';
        },
      });
  }

  openCreateColumnDialog(): void {
    const dialogRef = this.dialog.open(CreateColumnDialogComponent, {
      panelClass: 'app-dialog',
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      this.kanbanApi
        .createColumn(this.boardId, { title: result.title })
        .subscribe({
          next: (column) => {
            this.newColumnTitle = '';
            this.board = {
              ...this.board!,
              columns: [...this.board!.columns, { ...column, cards: [] }],
            };
          },
          error: () => {
            this.error = 'Erro ao criar coluna.';
          },
        });
    });
  }

  onColumnDeleted(columnId: string): void {
    if (!this.board) return;

    this.board = {
      ...this.board,
      columns: this.board.columns.filter((c) => c.id !== columnId),
    };
  }

  editBoard(): void {
    if (!this.board) return;

    const dialogRef = this.dialog.open(EditBoardDialogComponent, {
      data: { name: this.board.name },
      panelClass: 'app-dialog',
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      this.kanbanApi.updateBoard(this.board!.id, { name: result.name }).subscribe({
        next: (updated) => {
          this.board = { ...this.board!, name: updated.name };
        },
        error: () => {
          this.error = 'Erro ao renomear quadro.';
        },
      });
    });
  }

}

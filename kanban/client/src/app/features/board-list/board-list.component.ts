import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { KanbanApiService } from '../../core/services/kanban-api.service';
import { Board } from '../../core/models/board.model';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CreateBoardDialogComponent } from '../../shared/create-board-dialog/create-board-dialog.component';

@Component({
  selector: 'app-board-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    
    // Material
    MatToolbarModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './board-list.component.html',
})
export class BoardListComponent implements OnInit {
  boards: Board[] = [];
  loading = false;
  error: string | null = null;

  newBoardName = '';

  constructor(
    private kanbanApi: KanbanApiService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadBoards();
  }

  loadBoards(): void {
    this.loading = true;
    this.error = null;

    this.kanbanApi.getBoards().subscribe({
      next: (boards) => {
        this.boards = boards;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar quadros.';
        this.loading = false;
      },
    });
  }

  createBoard(): void {
    if (!this.newBoardName.trim()) return;

    this.kanbanApi.createBoard({ name: this.newBoardName.trim() }).subscribe({
      next: (board) => {
        this.boards.push(board);
        this.newBoardName = '';
      },
      error: () => {
        this.error = 'Erro ao criar quadro.';
      },
    });
  }

  openBoard(board: Board): void {
    this.router.navigate(['/boards', board.id]);
  }

  openCreateBoardDialog(): void {
    const dialogRef = this.dialog.open(CreateBoardDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      this.kanbanApi.createBoard(result).subscribe({
        next: (board) => {
          this.boards.push(board);
        },
        error: () => {
          this.error = 'Erro ao criar quadro.';
        },
      });
    });
  }
}

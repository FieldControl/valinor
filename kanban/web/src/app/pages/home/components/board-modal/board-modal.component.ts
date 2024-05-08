import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApiServiceService } from 'src/app/core/api/api-service.service';
import { BoardService } from 'src/app/pages/board/board.service';

@Component({
  selector: 'app-board-modal',
  templateUrl: './board-modal.component.html',
  styleUrls: ['./board-modal.component.scss'],
})
export class BoardModalComponent {
  boardName: string = '';

  constructor(
    private apiService: ApiServiceService,
    private dialogRef: MatDialogRef<BoardModalComponent>,
    private boardService: BoardService,
    private router: Router
  ) {}

  addBoard() {
    this.apiService.addBoard({ title: this.boardName }).subscribe({
      next: (response) => {
        const boardId = response.id;
        this.boardService.search$.next();
        this.router.navigate(['/board', boardId]);
        this.dialogRef.close();
      },
      error: (err) => {
        console.error('Erro ao adicionar board:', err);
      },
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { KanbanService } from '../kanban.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-board',
  standalone: true,
  templateUrl: './board.component.html',
  imports: [CommonModule, FormsModule],
})
export class BoardComponent implements OnInit {
  boards: any[] = [];
  newBoardTitle: string = '';
  selectedBoardId: string | null = null;
  editBoardTitle: string = '';
  showDialog: boolean = false;
  dialogMessage: string = '';

  constructor(private kanbanService: KanbanService, private router: Router) {}

  ngOnInit(): void {
    this.loadBoards();
  }

  loadBoards(): void {
    this.kanbanService.getBoards().subscribe((boards: any[]) => {
      this.boards = boards;
    });
  }

  addBoard(): void {
    if (!this.newBoardTitle.trim()) {
      this.dialogMessage = 'Por favor digite um título.';
      this.showDialog = true;
      return;
    }
    this.kanbanService.createBoard(this.newBoardTitle).subscribe((board: any) => {
      this.boards.push(board);
      this.newBoardTitle = '';
    });
  }

  editBoard(boardId: string, title: string): void {
    this.selectedBoardId = boardId;
    this.editBoardTitle = title;
  }

  updateBoard(): void {
    if (this.selectedBoardId) {
      this.kanbanService
        .updateBoard(this.selectedBoardId, this.editBoardTitle)
        .subscribe((updatedBoard: any) => {
          const board = this.boards.find((b) => b.id === this.selectedBoardId);
          if (board) {
            board.title = updatedBoard.title;
          }
          this.selectedBoardId = null;
          this.editBoardTitle = '';
        });
    }
  }

  cancelEdit(): void {
    this.selectedBoardId = null;
    this.editBoardTitle = '';
  }

  deleteBoard(boardId: string): void {
    this.kanbanService.deleteBoard(boardId).subscribe(() => {
      this.boards = this.boards.filter((board) => board.id !== boardId);
    });
  }

  navigateToBoard(boardId: string): void {
    this.router.navigate(['/board', boardId]);
  }

  closeDialog(): void {
    this.showDialog = false;
  }
}

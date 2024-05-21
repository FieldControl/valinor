import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BoardService } from '../../../services/board.service';
import { IBoard } from '../../../models/board';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AddBoardComponent } from '../add-board/add-board.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, filter, mergeMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { DeleteComponent } from '../../../delete/delete.component';

@Component({
  selector: 'app-boards',
  standalone: true,
  imports: [CommonModule, RouterModule, MatDialogModule, MatButtonModule],
  templateUrl: './boards.component.html',
  styleUrl: './boards.component.css',
})
export class BoardsComponent {
  private dialog = inject(MatDialog);
  private boardService = inject(BoardService)
  boards: IBoard[] = [];
  refetch$ = new Subject<void>();
  boardId: any
  private route = inject(ActivatedRoute)

  ngOnInit(): void {
    this.getBoards()
    this.route.params.subscribe(params => {
      this.boardId = params['id']
    })
  }

  openBoardDialog($event: Event, board?: IBoard) {
    $event.stopImmediatePropagation();
    $event.preventDefault();
    this.dialog
      .open(AddBoardComponent, { width: '400px', data: { board } })
      .afterClosed()
      .subscribe((board: IBoard) => {
        if (board) {
          this.getBoards();
        }
      });
  }

  deleteBoard($event: Event, board: IBoard) {
    $event.stopImmediatePropagation();
    $event.preventDefault();
    this.dialog
      .open(DeleteComponent, {
        data: {
          title: 'Deletar quadro',
          message: 'Deseja mesmo deletar o quadro?'
        }
      })
      .afterClosed()
      .pipe(
        filter((result) => result),
        mergeMap(() => this.boardService.delete(board._id)),
      )
      .subscribe(() => this.getBoards());
  }

  getBoards() {
    this.boardService.list().subscribe({
      next: (data) => {
        this.boards = data;
        console.log('Quadros', this.boards)
      },
      error: (e) => {
        console.log('Erro ao obter quadros: ',e)
      }
    })
  }

}

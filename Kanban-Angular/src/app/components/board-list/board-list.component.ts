import { Component, OnInit, inject } from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';


import { Subject, filter, mergeMap, of, switchMap } from 'rxjs';

import { HeaderComponent } from '../shared/header/header.component';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { BoardService } from '../../services/board.service';
import { IBoard, ICreateBoard } from '../../Models/board-model';
import { ConfirmComponent } from '../shared/confirm/confirm.component';
import { UpdateBoardComponent } from '../shared/add-board/update-board.component';

@Component({
  selector: 'app-board-list',
  standalone: true,
  imports: [SidebarComponent,HeaderComponent,RouterModule, MatCardModule, MatButtonModule, MatDialogModule],
  templateUrl: './board-list.component.html',
  styleUrl: './board-list.component.css'
})
export class BoardListComponent implements OnInit{
  private readonly dialog = inject(MatDialog);
  private readonly boardService = inject(BoardService);
  refetch$ = new Subject<void>();
  boards = toSignal(
    this.refetch$
      .asObservable()
      .pipe(switchMap(() => this.boardService.getBoards()))
  );

  ngOnInit(): void {
    this.refetch$.next();
  }

  //atualiza as informações do quadro usando uma tela de dialogo
  updateBoard($event: Event, board?: IBoard) {
    $event.stopImmediatePropagation();
    $event.preventDefault();
    this.dialog
      .open(UpdateBoardComponent, { width: '400px', data: { board } })
      .afterClosed()
      .subscribe((board: IBoard) => {
        board && this.refetch$.next();
      });
  }
  //cria um novo quadro
  createBoard(){
    let board : ICreateBoard = {
      name : "Kanban"
    }
    this.boardService
      .createBoard(board)
      .subscribe((board: IBoard) => {
        this.refetch$.next();;
      });
  }
  
  //deleta uma quadro usanod um dialogo de confirmação 
  deleteBoard($event: Event, board: IBoard) {
    $event.stopImmediatePropagation();
    $event.preventDefault();
    this.dialog
      .open(ConfirmComponent, {
        data: {
          title: 'Delete Board',
          message: 'Tem certeza que quer deletar ?',
        },
      })
      .afterClosed()
      .pipe(
        filter((result) => result),
        mergeMap(() => this.boardService.deleteBoard(board.id))
      )
      .subscribe(() => this.refetch$.next());
  }
}

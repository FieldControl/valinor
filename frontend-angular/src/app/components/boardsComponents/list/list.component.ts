import { Component, inject, OnInit, signal } from '@angular/core';
import { BoardService } from '../../../shared/services/boards/board.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddBoardComponent } from '../add-board/add-board.component';
import { HeaderComponent } from '../../homeCompenents/header/header.component';
import { NavbarComponent } from '../../homeCompenents/navbar/navbar.component';
import { Iboard } from '../../../shared/interfaces/board.interface';





@Component({
  imports: [RouterModule, CommonModule, MatDialogModule, HeaderComponent, NavbarComponent],  
  standalone: true,
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],

})
export class ListComponent {
  // private readonly dialog = inject(MatDialog)
  constructor(public dialog: MatDialog){}
  private readonly boardService = inject(BoardService);
  private readonly router = inject(Router)

 title = 'Boards'

 boards = toSignal(this.boardService.getBoards());


  openCreateNewBoard(board? : Iboard){
    this.dialog.open(AddBoardComponent, {
      width: '400px',
      position: {
        top: '-40%',
        left: '40%',
      },
      data: {
        board,
      }
    }).afterClosed()
  }

  deleteBoard(boardId: number){
    this.boardService.deleteBoarde(boardId).subscribe({
      complete: () => {
        window.location.reload();
      },
    })
  }


  navgateBoard( id: number){
    this.router.navigate(['boards', id]);
    console.log(id);
  }

}

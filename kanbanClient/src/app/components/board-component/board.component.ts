import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { BoardModel } from '../../models/board.model';
import { BoardService } from '../../services/board.service';
import { jwtDecode as jwt_decode } from 'jwt-decode';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ModalViewBoardComponent } from './modal-view-board/modal-view-board.component';
import { ModalBoardComponent } from './modal-board-component/modal-board.component';

@Component({
  selector: 'app-board-component',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatDialogModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent implements OnInit {

  constructor(private boardService: BoardService, private dialog: MatDialog) { }
  createBoard() {
    const dialogRef = this.dialog.open(ModalBoardComponent, {
      width: '95%',
      data: new BoardModel()
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.ngOnInit();
    });
  }


  openModal(model: BoardModel) {
    const dialogRef = this.dialog.open(ModalViewBoardComponent, {
      width: '95%',
      data: model
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      // Handle the result if needed
    });
  }


  myBoards: BoardModel[] = [];
  ngOnInit(): void {
    let token = localStorage.getItem('token');
    if (token) {
      let obj = jwt_decode(token);
      if (obj?.sub) {
        this.boardService.getBoards(Number(obj.sub)).subscribe((data) => {
          this.myBoards = data;
        });
      }
    }

  }
  delete(board: BoardModel) {
    this.boardService.deleteBoard(board.id.toString()).subscribe((data) => {
      this.ngOnInit();
    });
  }
}

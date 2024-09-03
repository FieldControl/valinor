import { Component, inject } from '@angular/core';
import { BoardService } from '../../../services/boards/board.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddBoardComponent } from '../add-board/add-board.component';
import { HeaderComponent } from '../../homeCompenents/header/header.component';
import { NavbarComponent } from '../../homeCompenents/navbar/navbar.component';


@Component({
  imports: [RouterModule, CommonModule,MatDialogModule,HeaderComponent, NavbarComponent],  
  standalone: true,
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],

})
export class ListComponent {
  private readonly dialog = inject(MatDialog)
  private readonly boardService = inject(BoardService);
  private readonly router = inject(Router)

 // Converte o observable retornado pelo serviço em um signal
 boards = toSignal(this.boardService.getBoards().pipe());
  

  openCreateNewBoard(){
    this.dialog.open(AddBoardComponent, {
      width: '400px',
    });
  }

  

    // dialogRef.afterClosed().subscribe(result => {
    //   console.log('The dialog was closed');
    // });
}

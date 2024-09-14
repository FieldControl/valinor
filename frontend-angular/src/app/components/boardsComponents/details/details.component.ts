import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { BoardService } from '../../../shared/services/boards/board.service';
import { HeaderComponent } from '../../homeCompenents/header/header.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule, NgFor, NgForOf, NgIf } from '@angular/common';
import { ColumnService } from '../../../shared/services/boards/column.service';
import { CardService } from '../../../shared/services/boards/card.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { identity, Observable, Subject, switchMap } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';




@Component({
  imports: [RouterModule, HeaderComponent, DragDropModule, NgFor, NgIf,ReactiveFormsModule, FormsModule, MatDialogModule, CommonModule],
  standalone: true,
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
  
})
export class DetailsComponent implements OnInit {

  private readonly router = inject(Router);
  private readonly boardService = inject(BoardService);
  private readonly activatedRouter = inject(ActivatedRoute);
  private readonly columnService = inject(ColumnService);
  private readonly cardService = inject(CardService);
  private readonly matDialog = inject(MatDialog);

  title = 'Kanban';
  nameColumn: string = '';

  refetch$ = new Subject<void>();

  boards = toSignal(this.boardService.getBoardById(this.activatedRouter.snapshot.params['id']));
  columns = toSignal(this.columnService.getColumnByBoardId(this.activatedRouter.snapshot.params['id']));

  ngOnInit(): void {
    this.refetch$.next();
  }


  addColumn(){
    const _columns = this.columns
    const _board = this.boards()?.id;
    if (!_board) return;
    this.columnService
    .createColumn({
      name: this.nameColumn,
      order: _columns.length || 0 + 1,    
      boardId: _board,
    })
    .subscribe(() =>{
      this.refetch$.next();
      window.location.reload();
    });
  }

  
  navgateBoard(){
    this.router.navigate(['boardsList']);
  }

  
}

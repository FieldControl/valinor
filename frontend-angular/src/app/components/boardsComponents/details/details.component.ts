import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { BoardService } from '../../../shared/services/boards/board.service';
import { HeaderComponent } from '../header/header.component';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule} from '@angular/common';
import { ColumnService } from '../../../shared/services/boards/column.service';
import { CardService } from '../../../shared/services/boards/card.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { identity, Observable, Subject, switchMap } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Icolumn } from '../../../shared/interfaces/column.interface';




@Component({
  imports: [RouterModule, HeaderComponent, DragDropModule, ReactiveFormsModule, FormsModule, MatDialogModule, CommonModule],
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

  title = 'Kanban Challenge';
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
      order: this.boards()?.column?.length || + 1,    
      boardId: _board,
    })
    .subscribe(() =>{
      this.refetch$.next();
      window.location.reload();
    });
  }

  deleteColumn(column : Icolumn){
    this.columnService.deleteColumn(column.id).subscribe(() =>{
      this.refetch$.next()
      window.location.reload()
    })
  }


  addCard(){
    console.log('this is my cardd')
  }


  dropColumn($event: CdkDragDrop<any>): void{
    console.log($event)
    moveItemInArray(
      this.boards()?.column || [],
      $event.previousIndex,
      $event.currentIndex
    )
  }




  navgateBoard(){
    this.router.navigate(['boardsList']);
  }

  
}

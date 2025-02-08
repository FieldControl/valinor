import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { BoardService } from '../../../shared/services/board.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Subject, switchMap } from 'rxjs';
import { ICard, IColumn } from '../../../shared/models/board.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddCardComponent } from '../components/add-card/add-card.component';
import { CardService } from '../../../shared/services/card.service';
import { EditColumnComponent } from '../components/edit-column/edit-column.component';
import { AddColumnComponent } from '../components/add-column/add-column.component';

@Component({
    selector: 'app-detail',
    imports: [
        MatButtonModule,
        RouterModule,
        DragDropModule,
        MatIconModule,
        ReactiveFormsModule,
        MatInputModule,
        MatDialogModule,
    ],
    templateUrl: './detail.component.html',
    styleUrl: './detail.component.scss'
})
export class DetailComponent implements OnInit {
  private readonly boardService = inject(BoardService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly matDialog = inject(MatDialog);
  private readonly cardService = inject(CardService);
  refetch$ = new Subject<void>();
  board = toSignal(
    this.refetch$
      .asObservable()
      .pipe(
        switchMap(() =>
          this.boardService.getBoardById(
            this.activatedRoute.snapshot.params['id']
          )
        )
      )
  );
  private readonly fb = inject(NonNullableFormBuilder);
  columnForm = this.fb.group({
    name: this.fb.control('', Validators.required),
  });

  ngOnInit(): void {
    this.refetch$.next();
  }

  editColumn(column: IColumn) {
    this.matDialog
      .open(EditColumnComponent, { width: '600px', data: { column } })
      .afterClosed()
      .subscribe(() => this.refetch$.next());
  }

  onCardChange($event: CdkDragDrop<any>, column: IColumn): void {
    if ($event.previousContainer === $event.container) {
      moveItemInArray(
        column.cards || [],
        $event.previousIndex,
        $event.currentIndex
      );
    } else {
      transferArrayItem(
        $event.previousContainer.data,
        $event.container.data,
        $event.previousIndex,
        $event.currentIndex
      );
    }

    const _board = this.board();
    if (!_board) return;

    const cards: ICard[] =
      _board.columns?.reduce((prev: ICard[], current: IColumn) => {
        const cards =
          current.cards?.map((c, idx) => ({
            ...c,
            columnId: current.id,
            order: idx,
          })) || [];

        return [...prev, ...cards];
      }, []) || [];

    this.cardService
      .updateCardOrdersAndColumns(_board.id, cards)
      .subscribe(() => {
        this.refetch$.next();
      });
  }

  onColumnChange($event: CdkDragDrop<any>): void {
    const _board = this.board();
    if (!_board) return;

    moveItemInArray(
      _board.columns || [],
      $event.previousIndex,
      $event.currentIndex
    );

    this.boardService
      .updateColumnOrder({
        boardId: _board.id,
        items:
          _board.columns?.map((column, index) => ({
            id: column.id,
            order: index,
          })) || [],
      })
      .subscribe(() => {
        this.refetch$.next();
      });
  }

  addOrEditCard(column: IColumn, card?: ICard) {
    this.matDialog
      .open(AddCardComponent, {
        width: '600px',
        data: {
          column: column,
          boardId: column.boardId,
          card,
        },
      })
      .afterClosed()
      .subscribe((card?: ICard) => {
        card && this.refetch$.next();
      });
  }

  addColumn() {
    this.matDialog
      .open(AddColumnComponent, { width: '600px', data: { board: this.board() } })
      .afterClosed()
      .subscribe(() => this.refetch$.next());
  }
}

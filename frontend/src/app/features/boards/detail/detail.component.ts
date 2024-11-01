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
import { SwimlanesService } from '../../../shared/services/swimlanes.service';
import { Subject, switchMap } from 'rxjs';
import { ICard, ISwimlane } from '../../../shared/models/board.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddCardComponent } from '../components/add-card/add-card.component';
import { CardService } from '../../../shared/services/card.service';
import { ConfirmComponent } from '../../../shared/ui/confirm/confirm.component';
import { EditSwimlaneComponent } from '../components/edit-swimlane/edit-swimlane.component';
import { CommonModule } from '@angular/common'; // Adicione esta importação

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    MatButtonModule,
    RouterModule,
    DragDropModule,
    MatIconModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDialogModule,
    CommonModule, // Adicione CommonModule aqui
  ],
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
  private readonly boardService = inject(BoardService);
  private readonly matDialog = inject(MatDialog);
  private readonly swimlaneService = inject(SwimlanesService);
  private readonly cardService = inject(CardService);
  private readonly activatedRoute = inject(ActivatedRoute);
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
  swimlaneForm = this.fb.group({
    name: this.fb.control('', Validators.required),
  });

  ngOnInit(): void {
    this.refetch$.next();
  }

  editSwimlane(swimlane: ISwimlane) {
    this.matDialog
      .open(EditSwimlaneComponent, { width: '600px', data: { swimlane } })
      .afterClosed()
      .subscribe(() => this.refetch$.next());
  }

  onCardChange($event: CdkDragDrop<any>, swimlane: ISwimlane): void {
    if ($event.previousContainer === $event.container) {
      moveItemInArray(
        swimlane.cards || [],
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
      _board.swimlanes?.reduce((prev: ICard[], current: ISwimlane) => {
        const cards =
          current.cards?.map((c, idx) => ({
            ...c,
            swimlaneId: current.id,
            order: idx,
          })) || [];

        return [...prev, ...cards];
      }, []) || [];

    this.cardService
      .updateCardOrdersAndSwimlanes(_board.id, cards)
      .subscribe(() => {
        this.refetch$.next();
      });
  }

  onSwimlaneChange($event: CdkDragDrop<any>): void {
    const _board = this.board();
    if (!_board) return;
    moveItemInArray(
      _board.swimlanes || [],
      $event.previousIndex,
      $event.currentIndex
    );

    this.boardService
      .updateSwimlaneOrder({
        boardId: _board.id,
        items:
          _board.swimlanes?.map((swimlane, index) => ({
            id: swimlane.id,
            order: index,
          })) || [],
      })
      .subscribe(() => {
        this.refetch$.next();
      });
    console.log(this.board()?.swimlanes);
  }

  addOrEditCard(swimlane: ISwimlane, card?: ICard) {
    this.matDialog
      .open(AddCardComponent, {
        width: '600px',
        data: {
          swimlane: swimlane,
          boardId: swimlane.boardId,
          card,
        },
      })
      .afterClosed()
      .subscribe((card?: ICard) => {
        card && this.refetch$.next();
      });
  }

  addSwimlane() {
    if (this.swimlaneForm.invalid) {
      return;
    }
    const _board = this.board();
    if (!_board) return;

    this.swimlaneService
      .createSwimlane({
        name: this.swimlaneForm.value.name as string,
        boardId: _board.id,
        order: _board.swimlanes?.length || 0,
      })
      .subscribe(() => {
        this.swimlaneForm.reset();
        this.refetch$.next();
      });
  }
}

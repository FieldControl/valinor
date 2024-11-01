import { Component, inject } from '@angular/core';
import { BoardService } from '../../../shared/services/board.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddBoardComponent } from '../components/add-board/add-board.component';
import { IBoard } from '../../../shared/models/board.model';
import { Subject, switchMap, filter } from 'rxjs';
import { ConfirmComponent } from '../../../shared/ui/confirm/confirm.component';


@Component({
  selector: 'app-list',
  standalone: true,
  imports: [RouterModule, MatCardModule, MatButtonModule, MatDialogModule, MatDialogModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent {
  private readonly dialog = inject(MatDialog);
  private readonly boardService = inject(BoardService);
  refetch$ = new Subject<void>();
  boards = toSignal(
    this.refetch$
      .asObservable()
      .pipe(switchMap(() => this.boardService.getBoards()))
  );

  ngOnInit() {
    this.refetch$.next();
  }


    // Abre um diálogo para adicionar um novo quadro (board).
    // Este método interrompe a propagação imediata do evento e previne a ação padrão.
    // Após o fechamento do diálogo, se um quadro for retornado, ele dispara um evento para refetch.
  abrirNovoFluxoBoard($event: Event, board?: IBoard) {
    $event.stopImmediatePropagation();
    $event.preventDefault();
    this.dialog
      .open(AddBoardComponent, {
        width: '400px',
        data: {
          board,
        },
      }).afterClosed()
      .subscribe((board: IBoard) => {
        board && this.refetch$.next();
      });
  }

  // Deleta um quadro (board).
  // Este método interrompe a propagação imediata do evento e previne a ação padrão.
  // Após a confirmação do diálogo, ele deleta o quadro e dispara um evento para refetch.
  
  deletarBoard($event: Event, board: IBoard) {
    $event.stopImmediatePropagation();
    $event.preventDefault();
    this.dialog.open(ConfirmComponent, {
      data: {
        titulo: 'Excluir quadro',
        mensagem: 'Tem certeza que deseja excluir este quadro?',
      },
    }).afterClosed()
    .pipe(
      filter((result) => result),
      switchMap(() => this.boardService.deletarBoard(board.id))
    )
    .subscribe(() => this.refetch$.next());
  }
}


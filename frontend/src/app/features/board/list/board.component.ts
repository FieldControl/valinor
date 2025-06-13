import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IBoard } from '../../../shared/DTO/board.dto';
import { Subject, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { BoardService } from '../../../shared/services/board.service';

@Component({
  selector: 'app-board.component',
  imports: [],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent {
  private readonly router = inject(Router)
  private readonly boardService = inject(BoardService)

  refetch$ = new Subject<void>();
  boards = toSignal(
    this.refetch$
      .asObservable()
      .pipe(switchMap(() => this.boardService.getAll()))
  );

  ngOnInit() {
    this.refetch$.next();
  }

  // Criação/edição de um board
  putBoard($event: Event, board?: IBoard) {
    $event.preventDefault();
    $event.stopPropagation();
    this.router.navigate(['/board/add'], {
      queryParams: { board: board ?? null }
    });
  }
}

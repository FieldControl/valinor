import { Component, inject } from '@angular/core';
import { BoardService } from '../../shared/services/board.service';
import { ActivatedRoute } from '@angular/router';
import { Subject, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-board-detail.component',
  imports: [ReactiveFormsModule],
  templateUrl: './board-detail.component.html',
  styleUrl: './board-detail.component.scss'
})
export class BoardDetailComponent {
  private readonly boardService = inject(BoardService);
  private readonly activatedRoute = inject(ActivatedRoute);
  refetch$ = new Subject<void>();
  board = toSignal(
    this.refetch$
      .asObservable()
      .pipe(
        switchMap(() =>
          this.boardService.getBoardById(
            this.activatedRoute.snapshot.params['id']
          )))
  );

  ngOnInit() {
    this.refetch$.next();
  }

  columnForm = new FormGroup({
    name: new FormControl("", [Validators.required, Validators.minLength(3)]),
    position: new FormControl("", [Validators.required, Validators.min(0)]),
  })

  addColumn(){

  }


}

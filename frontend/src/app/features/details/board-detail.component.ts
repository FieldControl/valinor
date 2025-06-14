import { Component, inject } from '@angular/core';
import { BoardService } from '../../shared/services/board.service';
import { ActivatedRoute } from '@angular/router';
import { Subject, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IColumnCreate } from '../../shared/DTO/column.dto';
import { ColumnService } from '../../shared/services/column.service';
import { TaskService } from '../../shared/services/task.service';
import { ITaskCreate } from '../../shared/DTO/task.dto';

@Component({
  selector: 'app-board-detail.component',
  imports: [ReactiveFormsModule],
  templateUrl: './board-detail.component.html',
  styleUrl: './board-detail.component.scss'
})
export class BoardDetailComponent {
  private readonly boardService = inject(BoardService);
  private readonly columnService = inject(ColumnService);
  private readonly taskService = inject(TaskService);
  private readonly activatedRoute = inject(ActivatedRoute);
  refetch$ = new Subject<void>();
  errorMessage = '';
  isLoading = false;
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

  addColumn() {
    if (this.columnForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const newColumn = {
      title: this.columnForm.value.name,
      position: Number(this.columnForm.value.position),
      boardId: this.board()?.id
    } as IColumnCreate;

    this.columnService.post(newColumn).subscribe({
      next: () => {
        this.refetch$.next();
        this.columnForm.reset();
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Error creating column:", error);
        this.errorMessage = 'Erro ao criar coluna. Tente novamente.';
        this.isLoading = false;
      }
    });
  }

  addTask(columnId: number, taskName: string) {
    if (!taskName || taskName.trim() === '') {
      this.errorMessage = "Informe o nome da tarefa.";
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const newTask = {
      title: taskName.trim(),
      columnId: columnId
    } as ITaskCreate;

    this.taskService.post(newTask).subscribe({
      next: () => {
        this.refetch$.next();
        // Limpar o input específico da coluna
        const inputElement = document.querySelector(`input[data-column-id="${columnId}"]`) as HTMLInputElement;
        if (inputElement) {
          inputElement.value = '';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Error creating task:", error);
        this.errorMessage = 'Erro ao criar tarefa. Tente novamente.';
        this.isLoading = false;
      }
    });
  }

  sortedColumns() {
    return this.board()?.columns?.sort((a, b) => a.position - b.position) || [];
  }


}

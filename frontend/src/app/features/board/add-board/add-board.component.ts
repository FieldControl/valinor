import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BoardService } from '../../../shared/services/board.service';
import { IBoardCreate, IBoard, IBoardUpdate } from '../../../shared/DTO/board.dto';

@Component({
  selector: 'app-add-board.component',
  imports: [ReactiveFormsModule],
  templateUrl: './add-board.component.html',
  styleUrl: './add-board.component.scss'
})
export class AddBoardComponent implements OnInit {
  private readonly boardService = inject(BoardService)
  private readonly router = inject(Router)

  protected title = "Adicionar Quadro";
  private boardToEdit?: IBoard;

  boardForm = new FormGroup({
    title: new FormControl("", [Validators.required, Validators.minLength(3)]),
  })

  ngOnInit() {
    const boardParam = history.state?.['board'];

    if (boardParam) {
      this.boardToEdit = boardParam as IBoard;
      this.title = "Editar Quadro";
      this.boardForm.patchValue({ title: boardParam.title });
    }
  }
  addBoard() {
    if (this.boardForm.invalid) return;

    const formValue = this.boardForm.value as IBoardCreate;
    // Edição
    if (this.boardToEdit) {
      this.boardService.patch({ ...formValue, id: this.boardToEdit.id } as IBoardUpdate)
        .subscribe(() => {
          this.router.navigate(['/boards']);
        });
    }
    // Criação
    else {
      this.boardService.post(formValue)
        .subscribe(() => {
          this.router.navigate(['/boards']);
        });
    }
  }
}

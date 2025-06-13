import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BoardService } from '../../../shared/services/board.service';
import { IBoardCreate } from '../../../shared/DTO/board.dto';

@Component({
  selector: 'app-add-board.component',
  imports: [ReactiveFormsModule],
  templateUrl: './add-board.component.html',
  styleUrl: './add-board.component.scss'
})
export class AddBoardComponent {
  private readonly boardService = inject(BoardService)
  private readonly router = inject(Router)
  protected title = "Adicionar Quadro";
  boardForm = new FormGroup({
    title: new FormControl("", [Validators.required, Validators.minLength(3)]),
  })
  
  addBoard() {
    if (this.boardForm.invalid) return;

    this.boardService.post(this.boardForm.value as IBoardCreate)
      .subscribe(() => {
        this.router.navigate(['/boards']);
      });
  }

}

import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { BoardService } from '../../../../shared/services/board.service';
import { IBoard, ICreateBoard } from '../../../../shared/models/board.model';

@Component({
  selector: 'app-add-board',
  standalone: true,
  imports: [ReactiveFormsModule, MatInputModule, MatButtonModule],
  templateUrl: './add-board.component.html',
  styleUrl: './add-board.component.scss'
})
export class AddBoardComponent {
  private readonly dialogRef = inject(MatDialogRef);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly boardService = inject(BoardService);
  readonly data = inject(MAT_DIALOG_DATA);
  addBoardForm = this.fb.group({
    nome: this.fb.control(this.data.board?.nome, [Validators.required]),
  });

  // criar ou editar quadro
  criarOuEditarBoard() {
    if (this.addBoardForm.invalid) {
      return;
    }

    if (this.data.board?.id) {
      this._atualizarBoard();
    }

    else {
      this._criarBoard();
    }
  }

  // atualizar quadro
  private _atualizarBoard() {
    this.boardService
      .atualizarBoard(this.data.board?.id, this.addBoardForm.value as ICreateBoard)
      .subscribe((board: IBoard) => {
        this.dialogRef.close(board);
      });
  }

  // criar quadro
  private _criarBoard() {
    this.boardService
      .criarBoard(this.addBoardForm.value as ICreateBoard)
      .subscribe((board: IBoard) => {
        this.dialogRef.close(board);
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}

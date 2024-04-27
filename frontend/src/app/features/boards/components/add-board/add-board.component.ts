import { Component, inject } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
  styleUrl: './add-board.component.scss',
})
export class AddBoardComponent {
  private readonly dialogRef = inject(MatDialogRef);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly boardService = inject(BoardService);
  data = inject(MAT_DIALOG_DATA);

  addBoardForm = this.fb.group({
    name: this.fb.control(this.data.board?.name, [Validators.required]),
  });

  createOrEditBoard() {
    if (this.addBoardForm.invalid) {
      return;
    }

    if (this.data.board?.id) {
      this._updateBoard();
    } else {
      this._createBoard();
    }
  }

  private _updateBoard() {
    this.boardService
      .updateBoard(this.data.board?.id, this.addBoardForm.value as ICreateBoard)
      .subscribe((board: IBoard) => {
        this.dialogRef.close(board);
      });
  }

  private _createBoard() {
    this.boardService
      .createBoard(this.addBoardForm.value as ICreateBoard)
      .subscribe((board: IBoard) => {
        this.dialogRef.close(board);
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}

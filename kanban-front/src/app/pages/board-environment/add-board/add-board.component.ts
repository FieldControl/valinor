import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BoardService } from '../../../services/board.service';
import { IBoard, ICreateBoard } from '../../../models/board';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-add-board',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-board.component.html',
  styleUrl: './add-board.component.css'
})

export class AddBoardComponent {
  private formBuilder = inject(FormBuilder)
  private boardService = inject(BoardService)
  private dialogRef = inject(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);

  addBoardFailed = false

  addBoardForm = this.formBuilder.group({
    name: this.formBuilder.control(this.data.board?.name, [Validators.required]),
    responsibles: this.formBuilder.control(this.data.board?.responsibles),
  })

  createOrEditBoard() {
    if (this.addBoardForm.invalid) {
      return;
    }

    if (this.data.board?._id) {
      this.updateBoard();
    } else {
      this.createBoard();
    }
  }

  private updateBoard() {
    if (this.addBoardForm.invalid) {
      this.addBoardFailed = true;
      return;
    }
  
    this.boardService.editByMail(this.data.board?._id, this.addBoardForm.value as ICreateBoard)
    .subscribe((board: IBoard) => {
        console.log('Sucesso');
        this.dialogRef.close(board)
      });
  }

  private createBoard() {
    if (this.addBoardForm.invalid) {
      this.addBoardFailed = true;
      return;
    }

    this.boardService.createByMail(this.addBoardForm.value as ICreateBoard)
    .subscribe((board: IBoard) => {
        console.log('Sucesso');
        this.dialogRef.close(board)
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}

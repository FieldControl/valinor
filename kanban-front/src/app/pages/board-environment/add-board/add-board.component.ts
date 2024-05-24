import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BoardService } from '../../../shared/services/board.service';
import { IBoard, ICreateBoard } from '../../../core/models/board';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../../../shared/services/user.service';

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
  private userService = inject(UserService)
  private dialogRef = inject(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);

  addBoardFailed = false
  noResponsibles = false
  noExistingMail = false

  ngOnInit() {
    if (this.data.board?._id) {
      this.userService.findEmailsByIds(this.data.board?.responsibles)
        .subscribe(emails => {
          this.addBoardForm.patchValue({ responsibles: emails.join(',') });
        });
    }
  }
  
  addBoardForm = this.formBuilder.group({
    name: this.formBuilder.control(this.data.board?.name, Validators.required),
    responsibles: this.formBuilder.control(this.data.board?.responsibles),
  })

  createOrEditBoard() {
    if (this.addBoardForm.invalid) {
      return;
    }

    let responsiblesArray = [];
    if (this.addBoardForm.value.responsibles) {
      responsiblesArray = this.addBoardForm.value.responsibles.split(',');
    }

    this.addBoardForm.patchValue({ responsibles: responsiblesArray });

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
      },(error) => {
        if (error.error.message.includes('Pelo menos um responsável deve ser fornecido')) {
          this.noResponsibles = true;
        }
        else if (error.error.message.includes('Cannot read properties of null')) {
          this.noExistingMail = true
        }
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
      }, (error) => {
        if (error.error.message.includes('Cannot read properties of null')) {
          this.noExistingMail = true
        }
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}

import { Component, inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BoardService } from '../../../services/boards/board.service';
import { CommonModule, NgIf } from '@angular/common';
import { Iboard, IcreateBoard } from '../../../interfaces/board.interface';



@Component({
  imports: [FormsModule, ReactiveFormsModule, CommonModule, NgIf],
  selector: 'app-add-board',
  templateUrl: './add-board.component.html',
  styleUrl: './add-board.component.css',
  standalone: true
})
export class AddBoardComponent {
  private dialogRef = inject(MatDialogRef);
  private boardService = inject(BoardService);
  data = inject(MAT_DIALOG_DATA);

  addBoard = '';

  createOrEditBoard(){
    const newBoard: IcreateBoard = {
      name : this.addBoard
    }
    if(!newBoard){
      return
    }

    if(this.data.board?.id){
      this.updateBoard()
    }
    
    else{
      this.createBoard()
    }
    
  }

  createBoard(){
    const newBoard: IcreateBoard = {
      name : this.addBoard
    }
    this.boardService.creatBoard(newBoard).subscribe({
      complete: () => {
        this.reloadPage()
        this.closeDialog()
      },
    })
  }

  updateBoard(){
    const newBoard: IcreateBoard = {
      name : this.addBoard
    }
    this.boardService.updateBoard(this.data.board?.id ,newBoard).subscribe({
      complete: () => {
        this.reloadPage()
        this.closeDialog()
      },
    })
  }

  
  
  
  
  reloadPage(): void {
    window.location.reload();
  }

  closeDialog(){
    this.dialogRef.close();
  }
}

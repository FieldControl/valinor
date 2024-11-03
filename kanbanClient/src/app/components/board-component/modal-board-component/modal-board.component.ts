import { Component, OnInit } from '@angular/core';
import { Form, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { BoardService } from '../../../services/board.service';
import { BoardModel } from '../../../models/board.model';
import { jwtDecode as jwt_decode } from 'jwt-decode';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-modal-board-component',
  standalone: true,
  imports: [MatInputModule, MatButtonModule, ReactiveFormsModule, FormsModule, MatFormFieldModule, MatFormField, MatDialogModule],
  templateUrl: './modal-board.component.html',
  styleUrl: './modal-board.component.css'
})
export class ModalBoardComponent implements OnInit {
  form: FormGroup = new FormGroup({});
  boardModel: BoardModel = new BoardModel();

  constructor(private fb: FormBuilder, private boardService: BoardService, private matDialogRef: MatDialogRef<ModalBoardComponent>) { }
  ngOnInit(): void {

    let token = localStorage.getItem('token');
    if (token) {
      let obj = jwt_decode(token);
      if (obj?.sub) {
        this.boardModel.userId = Number(obj.sub);
      }
    }
    this.form = this.fb.group({
      name: [this.boardModel.name,Validators.required],
      userId: this.boardModel.userId,
      status: 1
    });
  }
  submit() {
    if(this.form.valid){
      this.boardService.createBoard(this.form.value).subscribe((data) => {
        alert('board created successfully');
        this.closeModal();
      });
    }
  }
  closeModal() {
    this.matDialogRef.close();
  }

}

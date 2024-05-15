import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BoardService } from '../../../services/board.service';
import { IBoard, ICreateBoard } from '../../../models/board';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

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
  private router = inject(Router);
  private route = inject(ActivatedRoute)
  boardId : any

  addBoardFailed = false

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.boardId = params['id']
    })
  }

  addBoardForm = this.formBuilder.group({
    name: this.formBuilder.control('', [Validators.required]),
  })

  createOrEditBoard() {
    if (this.addBoardForm.invalid) {
      return;
    }

    if (this.boardId) {
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

    const formData = this.addBoardForm.value;
    if (formData.name) {
      const updatedBoard: ICreateBoard = {
          name: formData.name,
      };
      this.boardService.edit(this.boardId, updatedBoard).subscribe({next: (response) => {
          console.log('Sucesso', response);
          this.router.navigateByUrl('/boards');
      }});
    }

}


  private createBoard() {
    if (this.addBoardForm.invalid) {
      this.addBoardFailed = true
      return
    }

    const formData = this.addBoardForm.value
    if (formData.name){
    const newBoard: ICreateBoard = {
      name: formData.name,
    }

    this.boardService.create(newBoard).subscribe({next: (response) => {
      console.log('Sucesso', response)
      this.router.navigateByUrl('/boards')
    }})
  }
  }


}

import { Component, inject } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { BoardService } from '../../../services/board.service';
import { IBoard, ICreateBoard } from '../../../Models/board-model';

@Component({
  selector: 'app-add-board',
  standalone: true,
  imports: [ReactiveFormsModule, MatInputModule, MatButtonModule],
  templateUrl: './update-board.component.html',
  styleUrl: './update-board.component.css'
})
export class UpdateBoardComponent {
  private readonly dialogRef = inject(MatDialogRef); // Injeta a referência ao diálogo
  private readonly fb = inject(NonNullableFormBuilder); // Injeta o FormBuilder
  private readonly boardService = inject(BoardService); // Injeta o serviço BoardService
  data = inject(MAT_DIALOG_DATA); // Injeta os dados recebidos pelo diálogo

  // Define o formulário para adicionar um quadro, pré-preenchido com o nome do quadro se fornecido nos dados
  updateBoardForm = this.fb.group({
    name: this.fb.control(this.data.board?.name, [Validators.required]), // Define o controle de nome do quadro com validação obrigatória
  });

  // Função para atualizar o quadro
  public updateBoard() {
    this.boardService
      .updateBoard(this.data.board?.id, this.updateBoardForm.value as ICreateBoard) // Chama o método de atualização do quadro no serviço BoardService
      .subscribe((board: IBoard) => { // Subscreve para receber o quadro atualizado
        this.dialogRef.close(board); // Fecha o diálogo e passa o quadro atualizado como resultado
      });
  }

  // Função para fechar o diálogo
  closeDialog() {
    this.dialogRef.close(); // Fecha o diálogo sem passar nenhum resultado
  }
}
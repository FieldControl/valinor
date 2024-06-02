import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialog,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CardService } from '../../../services/card.service';
import { ICard } from '../../../Models/board-model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ColorPickerModule } from 'ngx-color-picker';

@Component({
  selector: 'app-add-card',
  standalone: true,
  providers: [provideNativeDateAdapter()], // Fornece um adaptador de data nativo para os componentes de data do Angular Material
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatDatepickerModule,
    ColorPickerModule
  ],
  templateUrl: './update-card.component.html',
  styleUrl: './update-card.component.css'
})
export class UpdateCardComponent {
  private readonly matDialog = inject(MatDialog); // Injeta o serviço MatDialog
  private readonly dialogRef = inject(MatDialogRef); // Injeta a referência ao diálogo
  private readonly fb = inject(NonNullableFormBuilder); // Injeta o FormBuilder
  private readonly cardService = inject(CardService); // Injeta o serviço CardService
  data = inject(MAT_DIALOG_DATA); // Injeta os dados recebidos pelo diálogo
  public color: string = this.data.card.color; // Obtém a cor do cartão dos dados

  // Define o formulário para adicionar um cartão, pré-preenchido com os dados do cartão
  updateCardForm = this.fb.group({
    order: this.fb.control(this.data.swimlane.cards.length), // Define o controle de ordem do cartão como o comprimento do array de cartões na swimlane
    boardId: this.fb.control(this.data.boardId), // Define o controle de boardId com o id do quadro
    swimlaneId: this.fb.control(this.data.swimlane.id), // Define o controle de swimlaneId com o id da swimlane
    name: this.fb.control(this.data.card?.name, [Validators.required]), // Define o controle de nome do cartão com validação obrigatória
    content: this.fb.control(this.data.card?.content, [Validators.required]), // Define o controle de conteúdo do cartão com validação obrigatória
    date: this.fb.control(this.data.card.date, [Validators.required]), // Define o controle de data do cartão com validação obrigatória
    userName: this.fb.control(this.data.card?.userName, [Validators.required]), // Define o controle de nome de usuário do cartão com validação obrigatória
    quantUsers: this.fb.control(this.data.card?.quantUsers, [Validators.required]) // Define o controle de quantidade de usuários do cartão com validação obrigatória
  });

  // Função para atualizar o cartão
  public updateCard() {
    if (this.updateCardForm.invalid) return; // Retorna se o formulário é inválido

    let card: ICard = this.updateCardForm.value as ICard; // Converte os valores do formulário para o tipo ICard
    card.color = this.color; // Define a cor do cartão

    // Chama o método de atualização do cartão no serviço CardService
    this.cardService
      .updateCard(this.data.card?.id, card)
      .subscribe((card: ICard) => {
        this.dialogRef.close(card); // Fecha o diálogo e passa o cartão atualizado como resultado
      });
  }

  // Função para fechar o diálogo
  closeDialog() {
    this.dialogRef.close(); // Fecha o diálogo sem passar nenhum resultado
  }
}

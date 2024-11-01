import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { CardService } from '../../../../shared/services/card.service';
import { ICard } from '../../../../shared/models/board.model';
import { ConfirmComponent } from '../../../../shared/ui/confirm/confirm.component';
import { filter, merge, mergeMap } from 'rxjs';

@Component({
  selector: 'app-add-card',
  standalone: true,
  imports: [ReactiveFormsModule, MatInputModule, MatButtonModule, MatDialogModule],
  templateUrl: './add-card.component.html',
  styleUrl: './add-card.component.scss'
})
export class AddCardComponent {
  private readonly matDialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly cardService = inject(CardService);
  data = inject(MAT_DIALOG_DATA);
  addCardForm = this.fb.group({
    ordem: this.fb.control(this.data.swimlane.cards.length),
    boardId: this.fb.control(this.data.boardId),
    swimlaneId: this.fb.control(this.data.swimlane.id),
    nome: this.fb.control(this.data.card?.nome, [Validators.required]),
    conteudo: this.fb.control(this.data.card?.conteudo, [Validators.required]),
  });

  // criar ou editar card
  criarOuEditarCard() {
    if (this.addCardForm.invalid) {
      return;
    }

    if (this.data.card?.id) {
      this._atualizarCard();
    }

    else {
      this._criarCard();
    }
  }

  //  atualizar card
  private _atualizarCard() {
    this.cardService
      .atualizarCard(this.data.card?.id, this.addCardForm.value as Partial<ICard>)
      .subscribe((card: ICard) => {
        this.dialogRef.close(card);
      });
  }
// criar card
  private _criarCard() {
    this.cardService
      .criarCard(this.addCardForm.value as Partial<ICard>)
      .subscribe((card: ICard) => {
        this.dialogRef.close(card);
      });
  }

  // excluir card
  deletarCard(){
    if(!this.data.card?.id) return;
    this.matDialog.open(ConfirmComponent, {
      data:{
        titulo: 'Excluir card',
        mensagem: 'Tem certeza que deseja excluir este card?'
      }
    }).afterClosed().pipe(
      filter((confirm) => confirm),
      mergeMap(() => this.cardService.deletarCard(this.data.card.id))
    )
    .subscribe(() => this.dialogRef.close(true));
}

  closeDialog() {
    this.dialogRef.close();
  }

}

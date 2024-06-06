import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ICard, ICreateQuadro, IQuadro } from '../../../../shared/services/models/quadro.model';
import { QuadroService } from '../../../../shared/services/quadro.service';
import { CardService } from '../../../../shared/services/card.service';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ConfirmComponent } from '../../../../shared/ui/confirm/confirm.component';
import { filter, mergeMap } from 'rxjs';

@Component({
  selector: 'app-add-card',
  standalone: true,
  imports: [ReactiveFormsModule, MatInputModule, MatButtonModule,MatDialogModule],
  templateUrl: './add-card.component.html',
  styleUrl: './add-card.component.css'
})
export class AddCardComponent {
  private readonly matDialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly cardService = inject(CardService);
  data = inject(MAT_DIALOG_DATA);
  
  addCardForm = this.fb.group({
    nome: this.fb.control(this.data.card?.nome, [Validators.required]),
    conteudo: this.fb.control(this.data.card?.conteudo, [Validators.required]),
    ordem: this.fb.control(this.data.coluna.cards.length),
    quadroId: this.fb.control(this.data.quadroId),
    colunaId: this.fb.control(this.data.coluna.id),
   
  });

  createOrEditCard() {
    if (this.addCardForm.invalid) {
      return;
    }

    if (this.data.card?.id) {
      this._updateCard();
    } else {
      this._createCard();
    }
  }

  private _updateCard() {
    this.cardService
      .updateCard(this.data.card?.id, this.addCardForm.value as Partial<ICard>)
      .subscribe((card: ICard) => {
        this.dialogRef.close(card);
      });
  }

  private _createCard() {
    this.cardService
      .createCard(this.addCardForm.value as  Partial<ICard>)
      .subscribe((card: ICard) => {
        this.dialogRef.close(card);
      });
  }

  deleteCard() {
    if (!this.data.card?.id) return;
    this.matDialog
      .open(ConfirmComponent, {
        data: {
          title: 'Deletar Card',
          message: 'Tem Certeza que deseja deletar esse card?',
        },
      })
      .afterClosed()
      .pipe(
        filter((confirm) => confirm),
        mergeMap(() => this.cardService.deleteCard(this.data.card.id))
      )
      .subscribe(() => this.dialogRef.close(true));
  }

  closeDialog() {
    this.dialogRef.close();
  }
}


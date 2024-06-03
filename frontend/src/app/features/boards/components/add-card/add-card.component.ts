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
import { ICard } from '../../../../shared/models/board.model';
import { CardService } from '../../../../shared/services/card.service';
import { ConfirmComponent } from '../../../../shared/ui/confirm/confirm.component';
import { filter, mergeMap } from 'rxjs';

@Component({
  selector: 'app-add-card',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './add-card.component.html',
  styleUrl: './add-card.component.scss',
})
export class AddCardComponent {
  private readonly matDialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly cardService = inject(CardService);
  data = inject(MAT_DIALOG_DATA);

  addCardForm = this.fb.group({
    order: this.fb.control(this.data.swimlane.cards.length),
    boardId: this.fb.control(this.data.boardId),
    swimlaneId: this.fb.control(this.data.swimlane.id),
    name: this.fb.control(this.data.card?.name, [Validators.required]),
    content: this.fb.control(this.data.card?.content, [Validators.required]),
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
      .createCard(this.addCardForm.value as Partial<ICard>)
      .subscribe((card: ICard) => {
        this.dialogRef.close(card);
      });
  }

  deleteCard() {
    if (!this.data.card?.id) return;
    this.matDialog
      .open(ConfirmComponent, {
        data: {
          title: 'Delete Card',
          message: 'Are you sure you want to delete this card?',
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

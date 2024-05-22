import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CardService } from '../../../services/card.service';
import { ICard } from '../../../models/card';
import { CommonModule } from '@angular/common';
import { DeleteComponent } from '../../../delete/delete.component';
import { filter, mergeMap } from 'rxjs';

@Component({
  selector: 'app-add-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,],
  templateUrl: './add-card.component.html',
  styleUrl: './add-card.component.css'
})
export class AddCardComponent {
  private formBuilder = inject(FormBuilder)
  data = inject(MAT_DIALOG_DATA);
  private cardService = inject(CardService)
  private dialogRef = inject(MatDialogRef);
  private dialog = inject(MatDialog);
  private columnId = this.data.columnId;

  addCardFailed = false

  addCardForm = this.formBuilder.group({
    name: this.formBuilder.control(this.data.card?.name, [Validators.required]),
    description: this.formBuilder.control(this.data.card?.description, [Validators.required]),
    dueDate: this.formBuilder.control(this.data.card?.dueDate),
  })

  createOrEditCard() {
    if (this.addCardForm.invalid) {
      return;
    }

    if (this.data.card?._id) {
      this.updateCard();
    } else {
      this.createCard();
    }
  }

  private updateCard() {
    if (this.addCardForm.invalid) {
      this.addCardFailed = true;
      return;
    }
  
    this.cardService.edit(this.data.card?._id, this.addCardForm.value as ICard)
    .subscribe((card: ICard) => {
        console.log('Sucesso');
        this.dialogRef.close(card)
      });
  }

  private createCard() {
    if (this.addCardForm.invalid) {
      this.addCardFailed = true;
      return;
    }

    this.cardService.create({
      ...this.addCardForm.value,
      column: this.columnId})
    .subscribe((card: ICard) => {
        console.log('Sucesso');
        this.dialogRef.close(card)
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }

}

import { Component, inject, OnInit } from '@angular/core';
import {
  MatDialogTitle,
  MatDialogContent,
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { CardModel } from '../../../services/kanban.service';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatAnchor } from '@angular/material/button';

@Component({
  selector: 'app-update-card-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatDialogActions,
    MatAnchor,
    MatError,
  ],
  templateUrl: './update-card-dialog.html',
  styleUrl: './update-card-dialog.css',
})
export class UpdateCardDialog {
  readonly dialogRef = inject(MatDialogRef<UpdateCardDialog>);
  private formBuilder = inject(FormBuilder);
  readonly data = inject<{ card: CardModel }>(MAT_DIALOG_DATA);

  cardForm: FormGroup = this.formBuilder.group({
    name: [this.data.card.name, [Validators.required]],
    description: [this.data.card.description ?? ''],
  });

  onSubmit() {
    if (!this.cardForm.valid) return;

    this.dialogRef.close({
      id: this.data.card.id,
      ...this.cardForm.value,
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
}

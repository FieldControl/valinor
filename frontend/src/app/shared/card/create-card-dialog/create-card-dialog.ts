import { Component, inject } from '@angular/core';
import {
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatAnchor } from '@angular/material/button';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-create-card-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatFormField,
    MatLabel,
    MatInput,
    MatDialogActions,
    MatAnchor,
    ReactiveFormsModule,
    MatError,
  ],
  templateUrl: './create-card-dialog.html',
  styleUrl: './create-card-dialog.css',
})
export class CreateCardDialog {
  readonly dialogRef = inject(MatDialogRef<CreateCardDialog>);
  private formBuilder = inject(FormBuilder);
  createCardForm: FormGroup = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
  });

  onConfirm() {
    if (!this.createCardForm.valid) return;
    this.dialogRef.close(this.createCardForm.value);
  }
  onCancel() {
    this.dialogRef.close();
  }
}

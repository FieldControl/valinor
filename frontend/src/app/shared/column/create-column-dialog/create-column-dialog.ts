import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'create-column-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './create-column-dialog.html',
  styleUrl: './create-column-dialog.css',
})
export class CreateColumnDialog {
  private dialogRef = inject(MatDialogRef<CreateColumnDialog>);
  private formBuilder = inject(FormBuilder);

  columnForm: FormGroup = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
  });

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.columnForm.valid) {
      this.dialogRef.close(this.columnForm.value);
    }
  }
}

import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogContent,
  MatDialogActions,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogClose,
  MatDialogTitle,
} from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-delete-card-dialog',
  imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle],
  templateUrl: './confirm-delete-card-dialog.html',
  styleUrl: './confirm-delete-card-dialog.css',
})
export class ConfirmDeleteCardDialog {
  readonly dialogRef = inject(MatDialogRef<ConfirmDeleteCardDialog>);
  readonly data = inject<{ name: string }>(MAT_DIALOG_DATA);

  onConfirmDelete() {
    this.dialogRef.close(true);
  }

  onCancelDelete() {
    this.dialogRef.close(false);
  }
}

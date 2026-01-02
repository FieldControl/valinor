import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-delete-column-dialog',
  imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle],
  templateUrl: './confirm-delete-column-dialog.html',
  styleUrl: './confirm-delete-column-dialog.css',
})
export class ConfirmDeleteColumnDialog {
  readonly dialogRef = inject(MatDialogRef<ConfirmDeleteColumnDialog>);
  readonly data = inject<{ columnName: string }>(MAT_DIALOG_DATA);

  onConfirmDelete() {
    this.dialogRef.close(true);
  }

  onCancelDelete() {
    this.dialogRef.close(false);
  }
}

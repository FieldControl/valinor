import { Component, Inject, EventEmitter, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-card-dialog',
  templateUrl: './card-dialog.component.html',
})
export class CardDialogComponent {
  @Output() cardDeleted = new EventEmitter<void>();

  constructor(
    public dialogRef: MatDialogRef<CardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, description: string }) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  deleteCard(): void {
    this.cardDeleted.emit();
    this.dialogRef.close();
  }
}
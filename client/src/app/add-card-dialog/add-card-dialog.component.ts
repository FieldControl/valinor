import { Component, Inject, EventEmitter, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-add-card-dialog',
  templateUrl: './add-card-dialog.component.html',
})
export class AddCardDialogComponent {
  @Output() cardAdded = new EventEmitter<{ title: string, description: string }>();

  constructor(
    public dialogRef: MatDialogRef<AddCardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  addCard(title: string, description: string): void {
    this.cardAdded.emit({ title, description });
    this.dialogRef.close();
  }
}
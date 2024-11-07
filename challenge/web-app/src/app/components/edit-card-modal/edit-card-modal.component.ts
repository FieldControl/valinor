import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CardService } from '../../services/card.service';
import { Card } from '../../interfaces/card';

@Component({
  selector: 'app-edit-card-modal',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatDialogModule,
  ],
  templateUrl: './edit-card-modal.component.html',
  styleUrl: './edit-card-modal.component.scss',
})
export class EditCardModalComponent {
  title = this.data.card.title;
  description = this.data.card.description;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { card: Card },
    public dialogRef: MatDialogRef<EditCardModalComponent>,
    private cardService: CardService
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.cardService.editCard(this.data.card.id ,{
      columnId: this.data.card.columnId,
      title: this.title,
      description: this.description
    });
    this.dialogRef.close();
  }
}

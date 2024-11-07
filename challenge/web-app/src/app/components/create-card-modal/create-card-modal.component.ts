import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { Column } from '../../interfaces/column';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CardService } from '../../services/card.service';

@Component({
  selector: 'app-create-card-modal',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatDialogModule,
  ],
  templateUrl: './create-card-modal.component.html',
  styleUrl: './create-card-modal.component.scss',
})
export class CreateCardModalComponent {
  title = '';
  description = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { column: Column },
    public dialogRef: MatDialogRef<CreateCardModalComponent>,
    private cardService: CardService
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.cardService.createCard({
      columnId: this.data.column.id,
      title: this.title,
      description: this.description,
    });
    this.dialogRef.close();
  }
}

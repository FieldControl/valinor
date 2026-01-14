import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-create-board-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    //Material
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './create-board-dialog.component.html',
  styleUrl: './create-board-dialog.component.scss'
})
export class CreateBoardDialogComponent {
  name = '';

  constructor(private dialogRef: MatDialogRef<CreateBoardDialogComponent>) { }

  cancel(): void {
    this.dialogRef.close(null);
  }

  confirm(): void {
    if (!this.name.trim()) return;
    this.dialogRef.close({ name: this.name.trim() });
  }
}

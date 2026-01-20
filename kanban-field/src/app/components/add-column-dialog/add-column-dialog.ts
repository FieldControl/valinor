import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { KanbanService } from '../../services/kanban.service';

@Component({
  selector: 'app-add-column-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatIconModule,
  ],
  templateUrl: './add-column-dialog.html',
  styleUrls: ['./add-column-dialog.scss'],
})
export class AddColumnDialogComponent {
  public title: string = '';

  public constructor(
    private dialogRef: MatDialogRef<AddColumnDialogComponent>,
    private kanbanService: KanbanService,
  ) {}

  public onCancel(): void {
    this.dialogRef.close();
  }

  public onSave(): void {
    if (this.title.length > 0) {
      if (this.title.length < 15) {
        this.dialogRef.close(this.title);
        return;
      }
      this.kanbanService.createWarningToast('O título deve ter no máximo 15 caracteres.');
      return;
    }
    this.kanbanService.createWarningToast('O título deve ter no mínimo 1 caractere.');
    return;
  }
}

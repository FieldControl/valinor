import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Column } from '../../core/models/column.model';
import { KanbanApiService } from '../../core/services/kanban-api.service';
import { CreateCardDialogComponent } from '../../shared/create-card-dialog/create-card-dialog.component';
import { KanbanCardComponent } from '../kanban-card/kanban-card.component';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-kanban-column',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    KanbanCardComponent,

    // Material
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './kanban-column.component.html',
})
export class KanbanColumnComponent {
  @Input() column!: Column;

  @Output() cardCreated = new EventEmitter<void>();

  newCardTitle = '';
  newCardDescription = '';
  newCardDueDate = '';

  error: string | null = null;

  constructor(
    private kanbanApi: KanbanApiService,
    private dialog: MatDialog
  ) { }

  createCard(): void {
    const title = this.newCardTitle.trim();
    const description = this.newCardDescription.trim();
    const dueDate = this.newCardDueDate.trim();

    if (!title) return;

    this.kanbanApi
      .createCard(this.column.id, {
        title,
        description: description || undefined,
        dueDate: dueDate || undefined,
      })
      .subscribe({
        next: () => {
          this.newCardTitle = '';
          this.newCardDescription = '';
          this.newCardDueDate = '';
          this.error = null;
          this.cardCreated.emit();
        },
        error: () => {
          this.error = 'Erro ao criar card.';
        },
      });
  }

  openCreateCardDialog(): void {
    const dialogRef = this.dialog.open(CreateCardDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      this.kanbanApi
        .createCard(this.column.id, result)
        .subscribe({
          next: () => {
            this.cardCreated.emit();
          },
          error: () => {
            this.error = 'Erro ao criar card.';
          },
        });
    });
  }

}

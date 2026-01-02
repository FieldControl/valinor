import { Component, inject, input } from '@angular/core';
import { CardModel, KanbanService } from '../../../services/kanban.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { UpdateCardDialog } from '../../../shared/card/update-card-dialog/update-card-dialog';
import { ConfirmDeleteCardDialog } from '../../../shared/card/confirm-delete-card-dialog/confirm-delete-card-dialog';

@Component({
  selector: 'app-card',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class Card {
  card = input.required<CardModel>();
  readonly dialog = inject(MatDialog);
  kanbanService = inject(KanbanService);

  openUpdateCardDialog() {
    const dialogRef = this.dialog.open(UpdateCardDialog, {
      data: {
        card: this.card(),
      },
      width: '350px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      this.kanbanService.updateCard(result).subscribe();
    });
  }

  openConfirmDeleteCardDialog() {
    const dialogRef = this.dialog.open(ConfirmDeleteCardDialog, {
      data: {
        name: this.card().name,
      },
      width: '350px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      this.kanbanService.deleteCard(this.card().id).subscribe();
    });
  }
}

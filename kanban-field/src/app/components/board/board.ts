import { Component, inject } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddColumnDialogComponent } from '../add-column-dialog/add-column-dialog';
import { CommonModule } from '@angular/common';
import { ColumnComponent } from '../column/column';
import { KanbanService } from '../../services/kanban.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-board',
  imports: [
    ColumnComponent,
    CommonModule,
    MatToolbarModule,
    CdkDropListGroup,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './board.html',
  styleUrls: ['./board.scss'],
})
export class Board {
  kanbanService = inject(KanbanService);
  dialog = inject(MatDialog);

  addCard(event: { columnId: string; title: string; cardText: string }) {
    this.kanbanService.addCard(event.columnId, event.title, event.cardText);
  }

  deleteCard(event: { columnId: string; cardId: string }) {
    this.kanbanService.deleteCard(event.columnId, event.cardId);
  }

  updateCard(event: { columnId: string; cardId: string; title: string; cardText: string }) {
    this.kanbanService.updateCard(event.columnId, event.cardId, event.title, event.cardText);
  }

  moveCard(event: { cardId: string; columnId: string }) {
    this.kanbanService.moveCard(event.cardId, event.columnId);
  }

  openAddColumnDialog() {
    const dialogRef = this.dialog.open(AddColumnDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.kanbanService.addColumn(result);
      }
    });
  }

  deleteColumn(event: any) {
    this.kanbanService.deleteColumn(event.columnId);
  }
}

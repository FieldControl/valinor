import { Component, computed, OnInit } from '@angular/core';
import { ColumnService } from '../../services/column.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Column } from '../../interfaces/column';
import { MatDialog } from '@angular/material/dialog';
import { EditColumnModalComponent } from '../edit-column-modal/edit-column-modal.component';
import { CreateCardModalComponent } from '../create-card-modal/create-card-modal.component';
import { Card } from '../../interfaces/card';
import { CardService } from '../../services/card.service';
import { EditCardModalComponent } from '../edit-card-modal/edit-card-modal.component';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './kanban.component.html',
  styleUrl: './kanban.component.scss',
})
export class KanbanComponent {
  columns = computed(() => this.columnService.columns());

  constructor(
    private columnService: ColumnService,
    private cardService: CardService,
    public dialog: MatDialog
  ) {}

  editColumn(column: Column): void {
    this.dialog.open(EditColumnModalComponent, {
      data: { column },
    });
  }

  deleteColumn(column: Column): void {
    this.columnService.deleteColumn(column.id);
  }

  addCard(column: Column): void {
    this.dialog.open(CreateCardModalComponent, {
      data: { column },
    });
  }

  editCard(card: Card): void {
    this.dialog.open(EditCardModalComponent, {
      data: { card },
    });
  }

  deleteCard(card: Card): void {
    this.cardService.deleteCard(card.id);
  }
}

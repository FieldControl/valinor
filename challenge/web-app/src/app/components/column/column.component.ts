import { Component, Input } from '@angular/core';
import { Column } from '../../interfaces/column';
import { ColumnService } from '../../services/column.service';
import { CardService } from '../../services/card.service';
import { MatDialog } from '@angular/material/dialog';
import { EditColumnModalComponent } from '../edit-column-modal/edit-column-modal.component';
import { CreateCardModalComponent } from '../create-card-modal/create-card-modal.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CardComponent } from "../card/card.component";

@Component({
  selector: 'app-column',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, CardComponent],
  templateUrl: './column.component.html',
  styleUrl: './column.component.scss',
})
export class ColumnComponent {
  @Input({ required: true }) column!: Column;

  constructor(
    private columnService: ColumnService,
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
}

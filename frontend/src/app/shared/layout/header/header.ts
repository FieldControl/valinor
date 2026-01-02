import { Component, inject, output } from '@angular/core';
import { CreateColumnDialog } from '../../column/create-column-dialog/create-column-dialog';
import { MatDialog } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { KanbanService } from '../../../services/kanban.service';

@Component({
  selector: 'board-header',
  imports: [MatButton],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private dialog = inject(MatDialog);
  private kanbanService = inject(KanbanService);
  columnCreated = output();

  openCreateColumnDialog(): void {
    const dialogRef = this.dialog.open(CreateColumnDialog, {
      width: '450px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.kanbanService.createColumn(result).subscribe();
      }
    });
  }
}

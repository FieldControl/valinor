import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KanbanService } from '../kanban.service';
import { CardComponent } from '../card/card.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogComponent } from '../../shared/dialog/dialog.component';

@Component({
  selector: 'app-board-detail',
  standalone: true,
  templateUrl: './board-detail.component.html',
  imports: [CommonModule, FormsModule, CardComponent, DialogComponent],
})
export class BoardDetailComponent implements OnInit {
  boardId: string | null = null;
  boardTitle: string | null = null;
  columns: any[] = [];
  newColumnTitle: string = '';
  showDialog: boolean = false;
  dialogMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private kanbanService: KanbanService
  ) {}

  ngOnInit(): void {
    this.boardId = this.route.snapshot.paramMap.get('id');
    this.loadBoard();
    this.loadColumns();
  }

  loadBoard(): void {
    if (this.boardId) {
      this.kanbanService.getBoardById(this.boardId).subscribe((board: any) => {
        this.boardTitle = board.title;
      });
    }
  }

  loadColumns(): void {
    if (this.boardId) {
      this.kanbanService
        .getColumnsByBoardId(this.boardId)
        .subscribe((columns: any[]) => {
          this.columns = columns.map((column) => ({
            ...column,
            newCardDescription: '',
            cards: column.cards || [], // Inicializa a lista de cards se não estiver definida
          }));
        });
    }
  }

  addColumn(): void {
    if (!this.newColumnTitle.trim()) {
      this.dialogMessage = 'Digite um título.';
      this.showDialog = true;
      return;
    }
    if (this.newColumnTitle.trim() && this.boardId) {
      this.kanbanService
        .createColumn(this.boardId, this.newColumnTitle)
        .subscribe((column: any) => {
          this.columns.push({ ...column, newCardDescription: '', cards: [] });
          this.newColumnTitle = '';
        });
    }
  }

  addCard(column: any): void {
    if (column.newCardDescription.trim()) {
      this.kanbanService
        .createCard(column.id, column.newCardDescription)
        .subscribe((card: any) => {
          column.cards.push(card);
          column.newCardDescription = '';
        });
    }
  }

  deleteColumn(columnId: string): void {
    this.kanbanService.deleteColumn(columnId).subscribe(() => {
      this.columns = this.columns.filter((column) => column.id !== columnId);
    });
  }

  editColumn(column: any): void {
    column.isEditing = true;
    column.editTitle = column.title;
  }

  updateColumn(column: any): void {
    if (column.editTitle.trim()) {
      this.kanbanService
        .updateColumn(column.id, column.editTitle)
        .subscribe((updatedColumn: any) => {
          column.title = updatedColumn.title;
          column.isEditing = false;
        });
    }
  }

  cancelEditColumn(column: any): void {
    column.isEditing = false;
    column.editTitle = '';
  }

  onCardDrop(event: any, column: any): void {
    const card = event.dragData;
    const previousColumn = this.columns.find((col) => col.cards.includes(card));
    if (previousColumn) {
      previousColumn.cards = previousColumn.cards.filter(
        (c: any) => c !== card
      );
    }
    column.cards.push(card);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  closeDialog(): void {
    this.showDialog = false;
  }
}

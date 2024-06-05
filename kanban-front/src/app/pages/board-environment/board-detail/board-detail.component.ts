import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ColumnService } from '../../../shared/services/column.service';
import { IColumn } from '../../../core/models/column';
import { IBoard } from '../../../core/models/board';
import { BoardService } from '../../../shared/services/board.service';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AddColumnComponent } from '../add-column/add-column.component';
import { FormBuilder, Validators } from '@angular/forms';
import { DeleteComponent } from '../../../shared/delete/delete.component';
import { filter, firstValueFrom, mergeMap } from 'rxjs';
import { ICard } from '../../../core/models/card';
import { AddCardComponent } from '../add-card/add-card.component';
import { CardService } from '../../../shared/services/card.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-board-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, CdkDropListGroup, CdkDropList, CdkDrag, MatDialogModule],
  templateUrl: './board-detail.component.html',
  styleUrl: './board-detail.component.css'
})
export class BoardDetailComponent {
  private columnService = inject(ColumnService)
  private boardService = inject(BoardService)
  private cardService = inject(CardService)
  private route = inject(ActivatedRoute)
  private dialog = inject(MatDialog);
  private formBuilder = inject(FormBuilder)
  private router = inject(Router);
  columns: IColumn[] = [];
  board: IBoard | undefined
  boardId = ''
  addColumnFailed = false

  addColumnForm = this.formBuilder.group({
    name: this.formBuilder.control('', Validators.required),
  })

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.boardId = params['id']
      this.getColumns(this.boardId)
      this.getBoard()
    })
  }

  async drop(event: CdkDragDrop<ICard[]>) {
    const card = event.item.data;
    const newIndex = event.currentIndex;

    if (card && card._id) {
        if (event.previousContainer === event.container && event.container.data) {
            await this.moveWithinColumn(event, card, newIndex);
        } else if (event.previousContainer.data && event.container.data) {
            const columnId = event.container.id;
            await this.moveBetweenColumns(event, card, columnId, newIndex);
        }
    }
}

async moveWithinColumn(event: CdkDragDrop<ICard[]>, card: ICard, newIndex: number) {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

    await firstValueFrom(this.cardService.updatePosition(card._id, newIndex));
    await this.updateAllPositions(event.container.data);

    this.getColumns(this.boardId);
}

async moveBetweenColumns(event: CdkDragDrop<ICard[]>, card: ICard, columnId: string, newIndex: number) {
    transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);

    await firstValueFrom(this.cardService.move(card._id, columnId));
    await firstValueFrom(this.cardService.updatePosition(card._id, newIndex));
    await this.updateAllPositions(event.container.data);
    
    this.getColumns(this.boardId);
}

async updateAllPositions(cards: ICard[]) {
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        if (card._id) {
            await firstValueFrom(this.cardService.updatePosition(card._id, i));
        }
    }
}

  openColumnDialog($event: Event, column?: IColumn) {
    $event.stopImmediatePropagation();
    $event.preventDefault();
    this.dialog
      .open(AddColumnComponent, { width: '400px', data: { column, boardId: this.boardId } })
      .afterClosed()
      .subscribe((column: IColumn) => {
        if (column) {
          this.getColumns(this.boardId);
        }
      });
  }

  openCardDialog($event: Event, columnId: string, card?: ICard) {
    $event.stopImmediatePropagation();
    $event.preventDefault();
    this.dialog
      .open(AddCardComponent, { width: '400px', data: { card, columnId } })
      .afterClosed()
      .subscribe((card: ICard) => {
        if (card) {
          this.getColumns(this.boardId);
        }
      });
  }

  getColumns(id: string) {
    this.columnService.findByBoard(id).subscribe({
      next: (data) => {
        this.columns = data;
        console.log('Colunas', this.columns)
      },
      error: (e) => {
        console.log('Erro ao obter colunas: ',e)
      }
    })
  }

  getBoard() {
    this.boardService.findById(this.boardId).subscribe({
      next: (data) => {
        this.board = data;
        console.log('Quadro', this.board)
      },
      error: (e: HttpErrorResponse) => {
        console.log('Erro ao obter quadros: ',e)
        if (e.status === 404 || e.status === 403 || e.status === 500) {
          this.router.navigate(['/boards']);
        }
      }
    })
  }

  deleteColumn($event: Event, column: IColumn) {
    $event.stopImmediatePropagation();
    $event.preventDefault();
    this.dialog
      .open(DeleteComponent, {
        data: {
          title: 'Deletar coluna',
          message: 'Deseja mesmo deletar a coluna?'
        }
      })
      .afterClosed()
      .pipe(
        filter((result) => result),
        mergeMap(() => this.columnService.delete(column._id)),
      )
      .subscribe(() => this.getColumns(this.boardId));
  }

  deleteCard($event: Event, card: ICard) {
    $event.stopImmediatePropagation();
    $event.preventDefault();
    this.dialog
      .open(DeleteComponent, {
        data: {
          title: 'Deletar cartão',
          message: 'Deseja mesmo deletar o cartão?'
        }
      })
      .afterClosed()
      .pipe(
        filter((result) => result),
        mergeMap(() => this.cardService.delete(card._id)),
      )
      .subscribe(() => this.getColumns(this.boardId));
  }
}

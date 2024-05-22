import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ColumnService } from '../../../services/column.service';
import { IColumn } from '../../../models/column';
import { IBoard } from '../../../models/board';
import { BoardService } from '../../../services/board.service';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AddColumnComponent } from '../add-column/add-column.component';
import { FormBuilder, Validators } from '@angular/forms';
import { DeleteComponent } from '../../../delete/delete.component';
import { filter, mergeMap } from 'rxjs';
import { ICard } from '../../../models/card';
import { AddCardComponent } from '../add-card/add-card.component';
import { CardService } from '../../../services/card.service';

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
  columns: IColumn[] = [];
  boards: IBoard[] = [];
  boardId = ''
  addColumnFailed = false

  addColumnForm = this.formBuilder.group({
    name: this.formBuilder.control('', Validators.required),
  })

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.boardId = params['id']
      this.getColumns(this.boardId)
      this.getBoards()
    })
  }

  async drop(event: CdkDragDrop<ICard[]>) {
    if (event.previousContainer === event.container && event.container.data) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      if (event.previousContainer.data && event.container.data) {
        transferArrayItem(event.previousContainer.data,
                          event.container.data,
                          event.previousIndex,
                          event.currentIndex);
    }
        const card = event.item.data;
        const columnId = event.container.id;
        const newIndex = event.currentIndex;
        console.log("id do card", card)
        console.log("id da coluna", columnId)
        console.log("toma tudo",event.container.data, event.previousIndex, event.currentIndex )
        if (card && card._id) {
          await this.cardService.move(card._id, columnId).toPromise();
          await this.cardService.updatePosition(card._id, newIndex).toPromise();
          this.getColumns(this.boardId);
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

  getBoards() {
    this.boardService.list().subscribe({
      next: (data) => {
        this.boards = data;
        console.log('Quadros', this.boards)
      },
      error: (e) => {
        console.log('Erro ao obter quadros: ',e)
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

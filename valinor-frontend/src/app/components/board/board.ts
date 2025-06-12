import { Component, OnInit, OnDestroy } from '@angular/core';
import { Column } from '../column/column';
import { CardForm } from '../card-form/card-form';
import { ColumnModel } from '../../models/column.model';
import { CardModel } from '../../models/card.model';
import { Kanban } from '../../services/kanban';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-board',
  imports: [CommonModule, Column, CardForm],
  standalone: true,
  templateUrl: './board.html',
  styleUrl: './board.scss'
})
export class Board implements OnInit, OnDestroy{
  private destroy$ = new Subject<void>();
  loading: boolean = false;
  error: string = '';
  columns: ColumnModel[] = [];
  cards: CardModel[] = [];

  constructor(private kanban: Kanban){}

  ngOnInit(): void {
    this.loading = true;
    this.kanban.getColumns()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (columns) => {
          this.columns = columns
          this.loading = false
        },
        error: (error) => {
          this.error = 'Erro ao carregar colunas';
          this.loading = false
          console.error('Erro ao carregar colunas')
        }
      })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addCard(columnId: string, content: string): void {
    this.loading = true;
    this.kanban.createCard(columnId, content)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newCard) => {
          const column = this.columns.find(col => col.id === columnId);
          if (column) {
            newCard.column = column
            column.cards.push(newCard)
          }
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Erro na criação do card';
          this.loading = false;
          console.error('Erro na criação do card', error)
        }
      })
  }

  editCard(cardId: string, content: string): void {
    this.loading = true;
    this.kanban.updateCard(cardId, content)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedCard) => {
          this.columns.forEach(column => {
            const cardFind = column.cards.find(card => card.id === cardId)
            if (cardFind) {
              cardFind.content = updatedCard.content;
              cardFind.order = updatedCard.order;
            }
        });
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erro na edição do card'
        this.loading = false;
        console.error('Erro na edição do card!', error)
      }
    });
  }
  moveCard(cardId: string, newColumnId: string): void {
    this.loading = true;
    this.kanban.moveCard(cardId, newColumnId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedCard) => {
          this.columns.forEach(column => {
            column.cards = column.cards.filter(card => card.id !== cardId);
          });
          const newColumn = this.columns.find(col => col.id === newColumnId);
          if (newColumn) {
            updatedCard.column = newColumn;
            newColumn.cards.push(updatedCard);
          }
          this.loading = false
        },
      });
  }

  deleteCard(cardId: string): void {
    this.loading = true;
    this.kanban.deleteCard(cardId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (deletedCard) => {
          this.columns.forEach(column => {
            const cardFind = column.cards.find(card => card.id === cardId)
            if(cardFind) {
              column.cards = column.cards.filter(card => card.id !== cardId)
            }
          });
          this.loading = false
        },
        error: (error) => {
          this.error = 'Erro na deleção do card'
          this.loading = false
          console.error('Erro na deleção do card', error)
        }
      });
  }

  isFormOpen: boolean = false

  openNewCardForm(): void {
    this.isFormOpen = true
  }
}

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CardModel, ColumnModel } from '../../models/kanban.model';
import { Column } from "../column/column";
import { CommonModule } from '@angular/common';
import { FormCard } from "../form-card/form-card";
import { KanbanService } from './kanban.service';
import { FormColumn } from '../form-column/form-column';
import { EditCard } from "../edit-card/edit-card";

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [Column, CommonModule, FormCard, FormColumn, EditCard],
  templateUrl: './kanban.html',
  styleUrl: './kanban.css'
})

export class Kanban implements OnInit {
  selectColumnId!: string;
  showFormCard = false;
  showFormColumn = false;
  showEditCard = false;
  selectCard: CardModel | null = null;

  columns: ColumnModel[] = [];
  cards: CardModel[] = [];

  constructor(
    private kanbanService: KanbanService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadKanbanData();
  }

  loadKanbanData(): void {
    this.kanbanService.getColumns().subscribe({
      next: (cols) => {
        this.columns = cols;
        this.cdr.detectChanges();
        console.log('Columns Loaded: ', this.columns);
      },
      error: (e) => {
        console.error('Error to load the columns', e);
      }
    });
  }

  // Form Card
  openFormCard(columnId: string): void {
    this.selectColumnId = columnId;
    this.showFormCard = true;
  }

  cardFormClosed(): void {
    this.showFormCard = false;
    this.selectColumnId = '';
    this.loadKanbanData();
  }

  // Form Column
  openFormColumn(): void {
    this.showFormColumn = true;
  }

  columnFormClosed(): void {
    this.showFormColumn = false;
    this.loadKanbanData();
  }

  // Edit Card
  openEditCard(card: CardModel): void {
    this.selectCard = card;
    this.showEditCard = true;
  }

  cardUpdated(updatedCard: CardModel): void {
    if (!updatedCard.id) {
      console.error('invalid id');
      return;
    }

    this.kanbanService.updateCard(updatedCard.id, updatedCard).subscribe({
      next: () => {
        console.log('Ok, success');
        this.showEditCard = false;
        this.selectCard = null;
        this.loadKanbanData();
      },
      error: (e) => {
        console.error('Error to update card:', e);
      }
    });
  }
     editCardClosed(): void {
        this.showEditCard = false;
        this.selectCard = null;
    }

  cardDeleted(cardId: string): void {
    this.kanbanService.deleteCard(cardId).subscribe({
      next: () => {
        console.log('Card deleted');
        this.showEditCard = false;
        this.selectCard = null;
        this.loadKanbanData();
      },
      error: (e) => {
        console.error('Error to delete: ', e);
      }
    });
  }
}
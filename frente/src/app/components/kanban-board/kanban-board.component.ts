import { Component, OnInit } from '@angular/core';
import { ColumnService } from '../../services/column.service';
import { BoardColumn } from '../../models/column.model';
import { ColumnComponent } from '../column/column.component';
import { CommonModule } from '@angular/common';  
import { FormsModule } from '@angular/forms';
import { Card } from '../../models/card.model';
import { CardService } from '../../services/card.service';

@Component({
  selector: 'app-kanban-board',
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.css'],
  standalone: true,
  imports: [FormsModule, ColumnComponent, CommonModule]
})
export class KanbanBoardComponent implements OnInit {
  columns: BoardColumn[] = [];
  newColumnTitle: string = '';

  constructor(
    private columnService: ColumnService,
    private cardService: CardService
  ) { }


  ngOnInit(): void {
    this.loadColumns();
  }

  loadColumns(): void {
    this.columnService.getColumns().subscribe(
      (data) => {
        this.columns = data;
      },
      (error) => {
        console.error('Erro ao carregar colunas:', error);
      }
    );
  }

  createColumn(): void {
    if (this.newColumnTitle.trim()) {
      this.columnService.createColumn(this.newColumnTitle).subscribe(
        (newColumn) => {
          this.columns.push(newColumn);
          this.newColumnTitle = '';
          this.loadColumns();
        },
        (error) => {
          console.error('Erro ao criar coluna:', error);
        }
      );
    }
  }

  deleteColumn(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta coluna e todos os seus cards?')) {
      this.columnService.deleteColumn(id).subscribe(
        () => {
          this.columns = this.columns.filter(column => column.id !== id);
        },
        (error) => {
          console.error('Erro ao excluir coluna:', error);
        }
      );
    }
  }

  onCardAdded(newCard: Card, columnId: number): void {
    const column = this.columns.find(col => col.id === columnId);
    if (column) {
      column.cards.push(newCard);
    }
  }

  onCardDropped(event: { card: Card, targetColumnId: number }): void {
      const { card, targetColumnId } = event;

      const sourceColumn = this.columns.find(col => col.cards.some(c => c.id === card.id));
      const targetColumn = this.columns.find(col => col.id === targetColumnId);

      

      if (!sourceColumn || !targetColumn) {
        console.error('Coluna de origem ou destino não encontrada');
        return;
      }
      

      sourceColumn.cards = sourceColumn.cards.filter(c => c.id !== card.id);
      targetColumn.cards.push(card);

      this.cardService.updateCard(card.id, { columnId: targetColumnId }).subscribe({
        next: updatedCard => {
          const idx = targetColumn.cards.findIndex(c => c.id === updatedCard.id);
          if (idx !== -1) {
            targetColumn.cards[idx] = updatedCard;
          }
        },
        error: err => {
          console.error('Erro ao atualizar card no backend', err);

          targetColumn.cards = targetColumn.cards.filter(c => c.id !== card.id);
          sourceColumn.cards.push(card);
        }
      });     
  }

    onCardDeleted(cardId: number): void {
    this.columns.forEach(column => {
      column.cards = column.cards.filter(card => card.id !== cardId);
    });

    this.cardService.deleteCard(cardId).subscribe({
      next: ()=>{
        console.log('Card Deletado com sucesso');
      },
      error: err=>{
        console.error('Erro ao deletar Card',err);
      }
    });
  } 
}
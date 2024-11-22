import { Component, OnInit } from '@angular/core';
import { KanbanService } from '../../services/kanban.service';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

interface Card {
  id: number;
  title: string;
  description: string;
}

interface Column {
  id: number;
  title: string;
  cards: Card[];
}

@Component({
  selector: 'app-kanban-board',
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.css'],
})
export class KanbanBoardComponent implements OnInit {
  columns: Column[] = [];

  constructor(private kanbanService: KanbanService) {}

  ngOnInit(): void {
    this.loadColumns();
  }

  loadColumns() {
    this.kanbanService.getColumns().subscribe((data) => {
      this.columns = data;
    });
  }

  addColumn(title: string) {
    if (!title.trim()) return;
    this.kanbanService.addColumn(title).subscribe(() => {
      this.loadColumns();
    });
  }

  deleteColumn(id: number) {
    this.kanbanService.deleteColumn(id).subscribe(() => {
      this.loadColumns();
    });
  }

  addCard(columnId: number, title: string, description: string) {
    if (!title.trim() || !description.trim()) return;
    this.kanbanService.addCard(columnId, title, description).subscribe(() => {
      this.loadColumns();
    });
  }

  deleteCard(cardId: number) {
    this.kanbanService.deleteCard(cardId).subscribe(() => {
      this.loadColumns();
    });
  }

  updateCard(cardId: number, newTitle: string | null, newDescription: string | null) {
    if (!newTitle || !newDescription) return;
    this.kanbanService.updateCard(cardId, newTitle, newDescription).subscribe(() => {
      this.loadColumns();
    });
  }

  // Card selecionado para exibir no modal
  selectedCard: any = null;

  // Método para abrir o modal com o card selecionado
  openModal(card: any): void {
    this.selectedCard = card;
  }

  // Método para fechar o modal
  closeModal(): void {
    if (this.selectedCard) {
      // Atualiza o conteúdo do card ao fechar o modal
      this.updateCard(this.selectedCard.id, this.selectedCard.title, this.selectedCard.description);
    }
    this.selectedCard = null;
  }
  
  // Atualiza o backend para refletir a nova coluna do card
  moveCard(cardId: number, targetColumnId: number): void {
    this.kanbanService.moveCard(cardId, targetColumnId).subscribe(() => {
      this.loadColumns();
    });
  }

  // Troca o card entre colunas 
  drop(event: CdkDragDrop<Card[]>, targetColumn: Column) {
    if (event.previousContainer === event.container) {
      // Reordena os cards na mesma coluna
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.updateCard(event.container.data[event.currentIndex].id, null, null); // Atualiza o backend para refletir a nova ordem dos cards na mesma coluna
    } else {
      // Move o card para outra coluna
      const card = event.previousContainer.data[event.previousIndex];
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
  
      this.moveCard(card.id, targetColumn.id);
    }
  }
}

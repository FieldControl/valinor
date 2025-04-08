import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KanbanService } from '../../services/kanban.service';
import { Column } from '../../models/column.model';
import { Card } from '../../models/card.model';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

//Componente principal do quadro Kanban
@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.css']
})
export class KanbanBoardComponent implements OnInit {
  columns: Column[] = [];         //Armazena as colunas do Kanban
  newColumnTitle: string = '';    //Título da nova coluna
  newCardTitle: string = '';      //Título do novo card
  newCardDescription: string = ''; //Descrição do novo card
  selectedColumnId: string = '';  //ID da coluna onde será adicionado o novo card

  constructor(private kanbanService: KanbanService) {}

  ngOnInit(): void {
    this.loadColumns();
  }

  //Carrega as colunas do backend
  loadColumns(): void {
    this.kanbanService.getColumns().subscribe((cols) => {
      this.columns = cols;
    });
  }

  //Cria uma nova coluna com base no título informado
  addColumn(): void {
    if (!this.newColumnTitle.trim()) return;
    this.kanbanService.createColumn(this.newColumnTitle).subscribe((col) => {
      this.columns = [...this.columns, col]; //Atualiza o array de colunas com a nova coluna
      this.newColumnTitle = ''; //Limpa o campo de input
    });
  }

  //Cria um novo card na coluna selecionada
  addCard(columnId: string): void {
    if (!this.newCardTitle.trim()) return;
    const input = {
      title: this.newCardTitle,
      description: this.newCardDescription?.trim() || '',
      columnId,
    };
    this.kanbanService.createCard(input).subscribe((card) => {
      this.columns = this.columns.map((col) => {
        if (col.id === columnId) {
          return {
            ...col,
            cards: [...col.cards, card], //Adiciona o novo card à coluna correspondente
          };
        }
        return col;
      });
      this.newCardTitle = ''; //Limpa o campo de título
      this.newCardDescription = ''; //Limpa o campo de descrição
      this.selectedColumnId = ''; //Reseta a coluna selecionada
    });
  }

  //Define a coluna atualmente selecionada para adicionar um novo card
  openCardForm(columnId: string): void {
    this.selectedColumnId = columnId;
  }

  //Fecha o formulário de novo card
  closeCardForm(): void {
    this.selectedColumnId = '';
    this.newCardTitle = '';
    this.newCardDescription = '';
  }

  //Atualiza o título da coluna
  editColumnTitle(column: Column): void {
    const newTitle = prompt('Novo título da coluna:', column.title);
    if (newTitle && newTitle.trim() !== column.title) {
      this.kanbanService.updateColumn(column.id, newTitle.trim()).subscribe((updated) => {
        column.title = updated.title;
      });
    }
  }

  //Remove uma coluna
  removeColumn(id: string): void {
    if (confirm('Tem certeza que deseja remover esta coluna?')) {
      this.kanbanService.deleteColumn(id).subscribe((success) => {
        if (success) {
          this.columns = this.columns.filter(col => col.id !== id); //Remove a coluna do array
        }
      });
    }
  }

  //Identificador único da coluna para otimizar renderização
  trackByColumnId(index: number, column: Column) {
    return column.id;
  }

  //Edita um card
  editCard(card: Card): void {
    const newTitle = prompt('Novo título do card:', card.title);
    const newDescription = prompt('Nova descrição do card:', card.description);
    if (newTitle && newDescription && (newTitle.trim() !== card.title || newDescription.trim() !== card.description)) {
      this.kanbanService.updateCard(card.id, newTitle.trim(), newDescription.trim()).subscribe((updatedCard) => {
        this.columns = this.columns.map((col) => ({
          ...col,
          cards: col.cards.map(c => c.id === card.id ? updatedCard : c) //Atualiza o card editado
        }));
      });
    }
  }

  //Remove um card
  removeCard(cardId: string): void {
    if (confirm('Tem certeza que deseja excluir este card?')) {
      this.kanbanService.deleteCard(cardId).subscribe((success) => {
        if (success) {
          this.columns = this.columns.map((col) => ({
            ...col,
            cards: col.cards.filter(c => c.id !== cardId) //Remove o card da coluna
          }));
        }
      });
    }
  }

  //Lógica de drag and drop entre colunas
  drop(event: CdkDragDrop<Card[]>, targetColumnId: string): void {
    console.log('Evento Drop:', event);
    const previousColumnId = event.previousContainer.id;
    const currentColumnId = targetColumnId;
    const card = event.item.data as Card;
    console.log('Card Original:', card);
    console.log('ID da Nova Coluna:', currentColumnId);
    console.log('ID da Coluna Anterior:', previousColumnId);

    if (previousColumnId === currentColumnId) {
      console.log('Card movido dentro da mesma coluna. Apenas reordenando.');
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex); //Reordena dentro da mesma coluna
    } else {
      console.log('Card movido para outra coluna.');
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      ); //Move para outra coluna
      const updatedCard: Card = {
        ...card,
        columnId: currentColumnId,
      };
      this.kanbanService.updateColumn(updatedCard.id, currentColumnId).subscribe({
        next: () => console.log('Card atualizado no backend'),
        error: (err) => console.error('Erro ao atualizar o card:', err),
      });
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { CardsService } from './cards.service';
import { ColumnsService } from './columns.service';
import { Card } from './card.model';
import { Column } from './column.model';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  tasks: Card[] = [];
  columns: Column[] = [];
  newCardTitle: string = '';
  newCardDescription: string = '';
  newCardColumnId: number = 0;
  newColumnTitle: string = '';
  isEditingModalOpen: boolean = false;
  isModalOpen: boolean = false;
  cardToEdit: Card | null = null;
  editingColumn: Column | null = null;

  constructor(
    private cardsService: CardsService,
    private columnsService: ColumnsService
  ) { }

  ngOnInit(): void {
    this.loadColumns();
  }

  loadColumns(): void {
    this.columnsService.getAllColumns().subscribe(
      (data: Column[]) => {
        this.columns = data
          .map((column, index) => ({ ...column, order: column.order || index }))
          .sort((a, b) => a.order - b.order);

        this.columns.forEach(column => {
          if (column.cards && column.cards.length) {
            column.cards = column.cards
              .map((card, index) => ({ ...card, order: card.order || index }))
              .sort((a, b) => a.order - b.order);
          }
        });
      },
      (error: any) => {
        console.error('Erro ao carregar colunas', error);
      }
    );
  }

  createCard(columnId: number, title: string, description: string): void {
    if (columnId > 0) {
      this.cardsService.createCard(title, description, columnId).subscribe(
        (newCard: Card) => {
          this.loadColumns();
        },
        (error: any) => {
          console.error('Erro ao criar card', error);
        }
      );
    } else {
      console.error('Coluna não válida');
    }
  }

  createColumn(title: string = ''): void {
    const order = this.columns.length + 1;
    this.columnsService.createColumn(title, order).subscribe(
      (newColumn: Column) => {
        this.columns.push(newColumn);
        this.loadColumns();
      },
      (error: any) => {
        console.error('Erro ao criar coluna', error);
      }
    );
  }

  editCard(task: Card, columnId: number): void {
    this.cardToEdit = { ...task, column: columnId };
    this.isEditingModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditingModalOpen = false;
    this.cardToEdit = null;
  }

  onDrop(event: CdkDragDrop<any[]>): void {
    const previousContainer = event.previousContainer;
    const currentContainer = event.container;

    if (previousContainer === currentContainer && previousContainer.id === 'kanban-board') {
      moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
      this.updateColumnOrder();
    }
    else if (previousContainer === currentContainer) {
      moveItemInArray(currentContainer.data, event.previousIndex, event.currentIndex);
      this.updateCardOrder(parseInt(currentContainer.id), currentContainer.data);
    }
    else {
      transferArrayItem(previousContainer.data, currentContainer.data, event.previousIndex, event.currentIndex);
      this.updateCardOrder(parseInt(currentContainer.id), currentContainer.data);
    }
  }

  updateColumnOrder(): void {
    this.columns.forEach((column, index) => {
      column.order = index;
      this.columnsService.updateColumn(column.id.toString(), { order: column.order }).subscribe();
    });
  }

  updateCardOrder(columnId: number, cards: Card[]): void {
    cards.forEach((card, index) => {
      card.order = index;
      if (card.id !== undefined) {
        this.cardsService.updateCard(card.id, card.title, card.description, card.column);
      } else {
        console.error('Card ID is undefined');
      }

    });
  }

  updateCard(): void {
    if (this.cardToEdit && this.cardToEdit.id && this.cardToEdit.column !== undefined) {
      const updatedData = {
        title: this.cardToEdit.title,
        description: this.cardToEdit.description,
        columnId: this.cardToEdit.column,
        order: this.cardToEdit.order
      };
      this.cardsService.updateCard(
        this.cardToEdit.id,
        this.cardToEdit.title,
        this.cardToEdit.description,
        this.cardToEdit.column
      ).subscribe(
        (updatedCard: Card) => {
          const index = this.tasks.findIndex((t) => t.id === updatedCard.id);
          if (index !== -1) {
            this.tasks[index] = updatedCard;
          }
          this.closeEditModal();
          this.loadColumns();
        },
        (error: any) => {
          console.error('Erro ao atualizar card', error);
          this.closeEditModal();
        }
      );
    } else {
      console.error('Erro: ID ou coluna não definido para o card.', this.cardToEdit);
    }
  }

  deleteCard(id: number): void {
    this.cardsService.deleteCard(id).subscribe(
      () => {
        this.tasks = this.tasks.filter((task) => task.id !== id);
        this.loadColumns();
      },
      (error: any) => {
        console.error('Erro ao excluir card', error);
      }
    );
  }

  createNewCardInColumn(columnId: number): void {
    if (columnId > 0) {
      this.createCard(columnId, '', '');
    } else {
      console.error('ID da coluna inválido para criar um novo card.');
    }
  }

  editColumn(column: Column): void {
    column.isEditing = true;
  }

  updateColumn(column: Column): void {
    if (!column.title.trim()) {
      console.error('O título não pode ser vazio.');
      return;
    }

    const updatedData: Partial<Column> = {
      title: column.title,
      order: column.order
    };

    this.columnsService.updateColumn(column.id.toString(), updatedData).subscribe(
      (updatedColumn: Column) => {
        const index = this.columns.findIndex((col) => col.id === updatedColumn.id);
        if (index !== -1) {
          this.columns[index] = updatedColumn;
        }
        column.isEditing = false;
        this.loadColumns();
      },
      (error: any) => {
        console.error('Erro ao atualizar coluna', error);
        column.isEditing = false;
      }
    );
  }

  deleteColumn(id: number): void {
    this.columnsService.deleteColumn(id.toString()).subscribe(
      () => {
        this.columns = this.columns.filter((column) => column.id !== id);
      },
      (error: any) => {
        console.error('Erro ao excluir coluna', error);
      }
    );
  }

  closeModal(): void {
    this.isModalOpen = false;
  }
}

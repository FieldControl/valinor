import { Component, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

const BASE_API_URL = 'http://localhost:3000/api';

interface Card {
  id?: number;
  title: string;
  position?: number;
  columnId: number;
  editing?: boolean;
  originalTitle?: string;
}

interface Column {
  id: number;
  title: string;
  position: number;
  boardId: number;
  cards: Card[];
}

interface Board {
  id: number;
  title: string;
  columns: Column[];
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'kanban',
  templateUrl: './kanban.html',
  styleUrls: ['./kanban.css']
})
export class Kanban implements OnInit {
  board: Board | null = null;
  columns: Column[] = [];
  draggedCard: Card | null = null;

  @ViewChildren('cardInput') cardInputs!: QueryList<ElementRef>;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadBoard();
  }

  loadBoard() {
    this.http.get<Board>(`${BASE_API_URL}/boards/1`).subscribe({
      next: (data) => {
        this.board = data;
        this.columns = data.columns.sort((a, b) => a.position - b.position);
        this.columns.forEach(column => {
          column.cards = column.cards.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        });
      },
      error: (error) => {
        console.error('Erro ao carregar o board:', error);
        alert('Erro ao carregar o quadro Kanban. Verifique o console.');
      }
    });
  }

  addCard(column: Column) {
    const newCard: Card = {
      title: '',
      columnId: column.id,
      position: column.cards.length > 0 ? Math.max(...column.cards.map(c => c.position!)) + 1 : 0,
      editing: true,
      originalTitle: ''
    };

    column.cards.push(newCard);

    setTimeout(() => {
      this.focusCardInput(newCard);
    }, 0);
  }

  editCard(card: Card) {
    card.editing = true;
    card.originalTitle = card.title;

    setTimeout(() => {
      this.focusCardInput(card);
    }, 0);
  }

  saveCardEdit(card: Card, newTitle: string) {
    const trimmedTitle = newTitle.trim();

    if (card.id === undefined && trimmedTitle === '') {
      this.columns.forEach(col => {
        col.cards = col.cards.filter(c => c !== card);
      });
      card.editing = false;
      return;
    }

    if (card.id !== undefined && trimmedTitle === '') {
      alert('O título do card não pode ser vazio. Revertendo para o título original.');
      card.title = card.originalTitle!;
      card.editing = false;
      this.loadBoard();
      return;
    }

    if (card.id !== undefined && trimmedTitle === card.originalTitle) {
      card.editing = false;
      return;
    }

    card.title = trimmedTitle;

    if (card.id === undefined) {
      this.http.post<Card>(`${BASE_API_URL}/cards`, {
        title: card.title,
        columnId: card.columnId,
        position: card.position
      }).subscribe({
        next: (createdCard) => {
          console.log('Card criado com sucesso:', createdCard);
          Object.assign(card, createdCard);
          card.editing = false;
          delete card.originalTitle;
        },
        error: (error) => {
          console.error('Erro ao criar card:', error);
          alert('Erro ao criar card. Verifique o console.');
          this.columns.forEach(col => {
            col.cards = col.cards.filter(c => c !== card);
          });
          delete card.originalTitle;
        }
      });
    } else {
      this.http.put<Card>(`${BASE_API_URL}/cards/${card.id}`, { title: card.title }).subscribe({
        next: (updatedCard) => {
          console.log('Card atualizado com sucesso:', updatedCard);
          card.editing = false;
          delete card.originalTitle;
        },
        error: (error) => {
          console.error('Erro ao atualizar card:', error);
          alert('Erro ao atualizar card. Verifique o console.');
          card.title = card.originalTitle!;
          card.editing = false;
          this.loadBoard();
          delete card.originalTitle;
        }
      });
    }
  }

  cancelCardEdit(card: Card) {
    if (card.id === undefined && (card.title === '' || card.originalTitle === '')) {
      this.columns.forEach(col => {
        col.cards = col.cards.filter(c => c !== card);
      });
    } else if (card.id !== undefined) {
      card.title = card.originalTitle!;
    }
    card.editing = false;
    delete card.originalTitle;
  }

  deleteCard(card: Card) {
    if (!confirm(`Tem certeza que deseja excluir o card "${card.title}"?`)) {
      return;
    }

    if (card.id === undefined) {
      this.columns.forEach(col => {
        col.cards = col.cards.filter(c => c !== card);
      });
      return;
    }

    this.http.delete(`${BASE_API_URL}/cards/${card.id}`).subscribe({
      next: () => {
        console.log('Card deletado com sucesso:', card.id);
        this.columns.forEach(col => {
          col.cards = col.cards.filter(c => c.id !== card.id);
        });
      },
      error: (error) => {
        console.error('Erro ao deletar card:', error);
        alert('Erro ao deletar card. Verifique o console.');
      }
    });
  }

  onDragStart(card: Card) {
    this.draggedCard = card;
  }

  onDrop(targetColumn: Column) {
    if (this.draggedCard) {
      if (this.draggedCard.columnId === targetColumn.id) {
        this.draggedCard = null;
        return;
      }

      this.columns.forEach(column => {
        column.cards = column.cards.filter(c => c.id !== this.draggedCard!.id);
      });

      this.draggedCard.columnId = targetColumn.id;
      this.draggedCard.position = targetColumn.cards.length > 0 ? Math.max(...targetColumn.cards.map(c => c.position ?? 0)) + 1 : 0;
      targetColumn.cards.push(this.draggedCard);

      this.columns.forEach(col => {
        col.cards = col.cards.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      });

      this.http.put<Card>(`${BASE_API_URL}/cards/${this.draggedCard.id}/move`, {
        newColumnId: this.draggedCard.columnId,
        newPosition: this.draggedCard.position
      }).subscribe({
        next: (movedCard) => {
          console.log('Card movido com sucesso:', movedCard);
        },
        error: (error) => {
          console.error('Erro ao mover card:', error);
          alert('Erro ao mover card. Verifique o console.');
          this.loadBoard();
        }
      });
    }
    this.draggedCard = null;
  }

  handleKeyDown(event: KeyboardEvent, card: Card, inputElement: HTMLInputElement) {
    if (event.key === 'Enter') {
      this.saveCardEdit(card, inputElement.value);
    } else if (event.key === 'Escape') {
      this.cancelCardEdit(card);
    }
  }

  focusCardInput(card: Card) {
    const inputElement = this.cardInputs.find(
      (elRef) => elRef.nativeElement.id === `card-input-${card.id}` ||
                     (card.id === undefined && elRef.nativeElement.id.startsWith('card-input-new'))
    );

    if (inputElement) {
      inputElement.nativeElement.focus();
      inputElement.nativeElement.select();
    } else {
      console.warn(`Não foi possível focar o input para o card com ID: ${card.id}`);
      if (card.id === undefined && this.cardInputs.length > 0) {
        const firstNewInput = this.cardInputs.find(elRef => elRef.nativeElement.id.startsWith('card-input-new'));
        if (firstNewInput) {
          firstNewInput.nativeElement.focus();
          firstNewInput.nativeElement.select();
        }
      }
    }
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Board, Column, Card } from '../../models/board.model';
import { KanbanService } from '../../services/kanban.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DragDropModule],
  template: `
    <div class="board-container" *ngIf="board">
      <div class="board-header">
        <div class="breadcrumb">
          <a routerLink="/">Quadros</a>
          <span> / </span>
          <span>{{ board.name }}</span>
        </div>
        <button
          class="btn btn-primary"
          (click)="showAddColumn = !showAddColumn"
        >
          Adicionar Coluna
        </button>
      </div>

      <div class="add-column-form" *ngIf="showAddColumn">
        <input
          type="text"
          [(ngModel)]="newColumnTitle"
          placeholder="Título da coluna"
          class="form-control"
          (keyup.enter)="createColumn()"
        />
        <button
          class="btn btn-success"
          (click)="createColumn()"
          [disabled]="!newColumnTitle.trim()"
        >
          Criar
        </button>
        <button class="btn btn-secondary" (click)="cancelAddColumn()">
          Cancelar
        </button>
      </div>

      <div class="board-content" cdkDropListGroup>
        <div
          class="column"
          *ngFor="let column of board.columns || []; trackBy: trackByColumnId"
        >
          <div class="column-header">
            <div class="column-title" *ngIf="editingColumn?.id !== column.id">
              <h3 (dblclick)="startEditColumn(column)">{{ column.title }}</h3>
              <span class="card-count">({{ column.cards?.length || 0 }})</span>
            </div>

            <div
              class="edit-column-form"
              *ngIf="editingColumn?.id === column.id"
            >
              <input
                type="text"
                [(ngModel)]="editColumnTitle"
                class="form-control"
                (keyup.enter)="updateColumn()"
                (blur)="updateColumn()"
                #editInput
              />
            </div>

            <div class="column-actions">
              <button
                class="btn btn-sm btn-primary"
                (click)="showAddCard(column)"
              >
                +
              </button>
              <button
                class="btn btn-sm btn-danger"
                (click)="deleteColumn(column)"
              >
                🗑️
              </button>
            </div>
          </div>

          <div
            class="add-card-form"
            *ngIf="addingCardToColumn?.id === column.id"
          >
            <input
              type="text"
              [(ngModel)]="newCardTitle"
              placeholder="Título do card"
              class="form-control"
              (keyup.enter)="focusCardDescription()"
            />
            <textarea
              [(ngModel)]="newCardDescription"
              placeholder="Descrição do card"
              class="form-control"
              rows="3"
              #descriptionTextarea
            ></textarea>
            <div class="form-actions">
              <button
                class="btn btn-success"
                (click)="createCard()"
                [disabled]="!newCardTitle.trim()"
              >
                Criar Card
              </button>
              <button class="btn btn-secondary" (click)="cancelAddCard()">
                Cancelar
              </button>
            </div>
          </div>

          <div
            class="cards-container"
            cdkDropList
            [cdkDropListData]="column.cards || []"
            (cdkDropListDropped)="drop($event, column)"
          >
            <div
              class="card"
              *ngFor="let card of column.cards || []; trackBy: trackByCardId"
              cdkDrag
              [cdkDragData]="card"
              (dblclick)="startEditCard(card)"
            >
              <div *ngIf="editingCard?.id !== card.id" class="card-content">
                <div class="card-title">{{ card.title }}</div>
                <div
                  class="card-description"
                  *ngIf="card.description && card.description.trim()"
                >
                  {{ card.description }}
                </div>
                <div class="card-actions">
                  <button
                    class="btn btn-outline"
                    (click)="startEditCard(card)"
                    title="Editar card"
                  >
                    ✏️
                  </button>
                  <button
                    class="btn btn-danger"
                    (click)="deleteCard(card)"
                    title="Excluir card"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div class="edit-card-form" *ngIf="editingCard?.id === card.id">
                <input
                  type="text"
                  [(ngModel)]="editCardTitle"
                  class="form-control"
                  placeholder="Título do card"
                />
                <textarea
                  [(ngModel)]="editCardDescription"
                  class="form-control"
                  placeholder="Descrição do card"
                  rows="3"
                ></textarea>
                <div class="form-actions">
                  <button class="btn btn-xs btn-success" (click)="updateCard()">
                    Salvar
                  </button>
                  <button
                    class="btn btn-xs btn-secondary"
                    (click)="cancelEditCard()"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="empty-board"
        *ngIf="!board.columns || board.columns.length === 0"
      >
        <h3>Quadro vazio</h3>
        <p>Comece adicionando uma coluna ao seu quadro!</p>
      </div>
    </div>

    <div class="loading" *ngIf="!board">
      <p>Carregando quadro...</p>
    </div>
  `,
  styleUrl: './board.component.scss',
})
export class BoardComponent implements OnInit {
  board: Board | null = null;
  boardId!: number;

  showAddColumn = false;
  newColumnTitle = '';
  editingColumn: Column | null = null;
  editColumnTitle = '';

  addingCardToColumn: Column | null = null;
  newCardTitle = '';
  newCardDescription = '';
  editingCard: Card | null = null;
  editCardTitle = '';
  editCardDescription = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private kanbanService: KanbanService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.boardId = Number(id);
        this.loadBoard();
      }
    });
  }

  loadBoard(): void {
    this.kanbanService.getBoard(this.boardId).subscribe({
      next: (board) => {
        this.board = board;
        if (this.board.columns && Array.isArray(this.board.columns)) {
          this.board.columns = [...this.board.columns].sort((a, b) => {
            const orderA = typeof a.order === 'number' ? a.order : 0;
            const orderB = typeof b.order === 'number' ? b.order : 0;
            return orderA - orderB;
          });

          this.board.columns.forEach((column) => {
            if (column.cards && Array.isArray(column.cards)) {
              column.cards = [...column.cards].sort((a, b) => {
                const orderA = typeof a.order === 'number' ? a.order : 0;
                const orderB = typeof b.order === 'number' ? b.order : 0;
                return orderA - orderB;
              });
            }
          });
        }
      },
      error: (error) => {
        console.error('Erro ao carregar quadro:', error);
        this.router.navigate(['/']);
      },
    });
  }

  createColumn(): void {
    if (!this.newColumnTitle.trim()) return;

    this.kanbanService
      .createColumn({
        boardId: this.boardId,
        title: this.newColumnTitle.trim(),
      })
      .subscribe({
        next: () => {
          this.loadBoard();
          this.cancelAddColumn();
        },
        error: (error) => {
          console.error('Erro ao criar coluna:', error);
        },
      });
  }

  startEditColumn(column: Column): void {
    this.editingColumn = column;
    this.editColumnTitle = column.title;
  }

  updateColumn(): void {
    if (!this.editingColumn || !this.editColumnTitle.trim()) {
      this.cancelEditColumn();
      return;
    }

    this.kanbanService
      .updateColumn({
        id: Number(this.editingColumn.id),
        title: this.editColumnTitle.trim(),
      })
      .subscribe({
        next: () => {
          this.loadBoard();
          this.cancelEditColumn();
        },
        error: (error) => {
          console.error('Erro ao atualizar coluna:', error);
          this.cancelEditColumn();
        },
      });
  }

  deleteColumn(column: Column): void {
    if (!confirm(`Tem certeza que deseja excluir a coluna "${column.title}"?`))
      return;

    this.kanbanService.deleteColumn(Number(column.id)).subscribe({
      next: () => {
        this.loadBoard();
      },
      error: (error) => {
        console.error('Erro ao excluir coluna:', error);
      },
    });
  }

  showAddCard(column: Column): void {
    this.addingCardToColumn = column;
    this.newCardTitle = '';
    this.newCardDescription = '';
  }

  createCard(): void {
    if (!this.addingCardToColumn || !this.newCardTitle.trim()) return;

    this.kanbanService
      .createCard({
        columnId: Number(this.addingCardToColumn.id),
        title: this.newCardTitle.trim(),
        description: this.newCardDescription.trim(),
      })
      .subscribe({
        next: () => {
          this.loadBoard();
          this.cancelAddCard();
        },
        error: (error) => {
          console.error('Erro ao criar card:', error);
        },
      });
  }

  startEditCard(card: Card): void {
    this.editingCard = card;
    this.editCardTitle = card.title;
    this.editCardDescription = card.description || '';
  }

  updateCard(): void {
    if (!this.editingCard || !this.editCardTitle.trim()) {
      this.cancelEditCard();
      return;
    }

    this.kanbanService
      .updateCard({
        id: Number(this.editingCard.id),
        title: this.editCardTitle.trim(),
        description: this.editCardDescription.trim(),
        columnId: Number(this.editingCard.column.id),
      })
      .subscribe({
        next: () => {
          this.loadBoard();
          this.cancelEditCard();
        },
        error: (error) => {
          console.error('Erro ao atualizar card:', error);
          this.cancelEditCard();
        },
      });
  }

  deleteCard(card: Card): void {
    if (!confirm(`Tem certeza que deseja excluir o card "${card.title}"?`))
      return;

    this.kanbanService.deleteCard(Number(card.id)).subscribe({
      next: () => {
        this.loadBoard();
      },
      error: (error) => {
        console.error('Erro ao excluir card:', error);
      },
    });
  }

  drop(event: CdkDragDrop<Card[]>, targetColumn: Column): void {
    if (!targetColumn.cards) {
      targetColumn.cards = [];
    }

    const previousContainer = event.previousContainer.data;
    if (!Array.isArray(previousContainer)) {
      console.error('Previous container data is not an array');
      return;
    }

    const draggedCard = event.item.data as Card;

    if (event.previousContainer === event.container) {
      const mutableCards = [...event.container.data];
      moveItemInArray(mutableCards, event.previousIndex, event.currentIndex);
      targetColumn.cards = mutableCards;

      this.kanbanService
        .reorderCard({
          id: Number(draggedCard.id),
          newIndex: event.currentIndex,
        })
        .subscribe({
          next: () => {},
          error: (error) => {
            console.error('Erro ao reordenar card:', error);
            this.loadBoard();
          },
        });
    } else {
      const mutablePreviousCards = [...event.previousContainer.data];
      const mutableTargetCards = [...event.container.data];

      transferArrayItem(
        mutablePreviousCards,
        mutableTargetCards,
        event.previousIndex,
        event.currentIndex
      );

      const sourceColumn = this.board?.columns?.find(
        (col) => col.cards === event.previousContainer.data
      );
      if (sourceColumn) {
        sourceColumn.cards = mutablePreviousCards;
      }
      targetColumn.cards = mutableTargetCards;

      this.kanbanService
        .moveCard({
          id: Number(draggedCard.id),
          columnId: Number(targetColumn.id),
        })
        .subscribe({
          next: () => {
            this.loadBoard();
          },
          error: (error) => {
            console.error('Erro ao mover card:', error);
            this.loadBoard();
          },
        });
    }
  }

  focusCardDescription(): void {
    setTimeout(() => {
      const textarea = document.querySelector(
        'textarea'
      ) as HTMLTextAreaElement;
      if (textarea) textarea.focus();
    });
  }

  trackByColumnId(index: number, column: Column): string {
    return column.id;
  }

  trackByCardId(index: number, card: Card): string {
    return card.id;
  }

  cancelAddColumn(): void {
    this.showAddColumn = false;
    this.newColumnTitle = '';
  }

  cancelEditColumn(): void {
    this.editingColumn = null;
    this.editColumnTitle = '';
  }

  cancelAddCard(): void {
    this.addingCardToColumn = null;
    this.newCardTitle = '';
    this.newCardDescription = '';
  }

  cancelEditCard(): void {
    this.editingCard = null;
    this.editCardTitle = '';
    this.editCardDescription = '';
  }
}

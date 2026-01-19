import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { transferArrayItem } from '@angular/cdk/drag-drop';
import { ColumnsService } from './services/columns.service';
import { CardsService } from './services/cards.service';
import { KanbanColumn, KanbanCard } from './kanban-column.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App implements OnInit {
  // ===== KANBAN =====
  columns: KanbanColumn[] = [];

  // ===== COLUNAS =====
  showAddColumn = false;
  newColumnTitle = '';

  // ===== CARD (CRIAR) =====
  newCardTitle = '';
  newCardDescription = '';
  newCardPriority: 'BAIXA' | 'MEDIA' | 'ALTA' = 'MEDIA';
   selectedColumnId: number | null = null;

  // ===== CARD (EDITAR) =====
  editingCardId: number | null = null;
  editTitle = '';
  editDescription = '';
  editPriority: 'BAIXA' | 'MEDIA' | 'ALTA' = 'MEDIA';

  constructor(
    private columnsService: ColumnsService,
    private cardsService: CardsService
  ) {}

  // ===== INIT =====
  ngOnInit() {
    this.loadColumns();
  }

  // ===== LOAD =====
  loadColumns() {
    this.columnsService.getColumns().subscribe({
      next: columns => (this.columns = columns),
      error: err => console.error('Erro ao carregar colunas', err),
    });
  }

  // ===== COLUNAS =====
  toggleAddColumn() {
    this.showAddColumn = !this.showAddColumn;
  }

  addColumn() {
    if (!this.newColumnTitle.trim()) return;

    this.columnsService.createColumn(this.newColumnTitle).subscribe(() => {
      this.newColumnTitle = '';
      this.loadColumns();
    });
  }

  deleteColumn(column: KanbanColumn) {
    if (!confirm(`Excluir a coluna "${column.title}"?`)) return;

    this.columnsService.deleteColumn(column.id).subscribe(() => {
      this.loadColumns();
    });
  }

  // ===== CARDS =====
  addCard(columnId: number) {
    if (!this.newCardTitle.trim()) return;

    this.cardsService
      .createCard({
        title: this.newCardTitle,
        description: this.newCardDescription,
        priority: this.newCardPriority,
        columnId,
      })
      .subscribe(() => {
        this.newCardTitle = '';
        this.newCardDescription = '';
        this.newCardPriority = 'MEDIA';
        this.loadColumns();
      });
  }

  deleteCard(card: KanbanCard) {
    if (!confirm(`Excluir o card "${card.title}"?`)) return;

    this.cardsService.deleteCard(card.id).subscribe(() => {
      this.loadColumns();
    });
  }

  // ===== EDITAR CARD =====
  startEdit(card: KanbanCard) {
    this.editingCardId = card.id;
    this.editTitle = card.title;
    this.editDescription = card.description ?? '';
    this.editPriority = card.priority;
  }

  cancelEdit() {
    this.editingCardId = null;
  }

  saveEdit(card: KanbanCard) {

    if (!this.editTitle.trim()) return;
    console.log('SALVANDO CARD', card.id);
    this.cardsService
      .updateCard(card.id, {
        title: this.editTitle,
        description: this.editDescription,
        priority: this.editPriority,
      })
      .subscribe(() => {
        this.editingCardId = null;
        this.loadColumns();
      });
  }

  // ===== DRAG & DROP =====
  onDrop(event: CdkDragDrop<KanbanCard[]>, targetColumn: KanbanColumn) {
    if (event.previousContainer === event.container) {
      return;
    }

    // 1️⃣ Atualiza o FRONT imediatamente
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    const movedCard = event.container.data[event.currentIndex];

    // 2️⃣ Atualiza no BACKEND
    this.cardsService
      .updateCardColumn(movedCard.id, targetColumn.id)
      .subscribe({
        error: () => {
          // 🔥 Se der erro no backend, volta o card
          transferArrayItem(
            event.container.data,
            event.previousContainer.data,
            event.currentIndex,
            event.previousIndex
          );
        },
      });
  }

  get connectedDropLists(): string[] {
    return this.columns.map(c => `column-${c.id}`);
  }
}

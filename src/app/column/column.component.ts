import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CardComponent } from '../card/card.component';
import { ModalComponent } from '../modal/modal.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-column',
  imports: [CardComponent, ModalComponent, CommonModule],
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.css'],
})
export class ColumnComponent {
  @Input() titulo?: string;
  @Input() columnId!: string; // Identificador único para cada coluna
  @Output() cardMoved = new EventEmitter<{
    card: { title: string; description: string };
    targetColumnId: string;
  }>();

  isModalOpen = false;
  cards: { title: string; description: string }[] = [];

  draggedCardIndex: number | null = null;

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
  onCardAdded(card: { title: string; description: string }) {
    // Adiciona o card na coluna atual com os dados do modal (título e descrição)
    this.cards.push(card);
    this.closeModal();
  }

  removeCard(index: number) {
    // Remove o card da coluna
    this.cards.splice(index, 1);
  }

  onDragStart(event: DragEvent, index: number) {
    // Marca o índice do card arrastado
    this.draggedCardIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', `${this.columnId}:${index}`);
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    const column = event.currentTarget as HTMLElement;
    column.classList.add('drag-over');
  }

  onDragLeave(event: DragEvent) {
    const column = event.currentTarget as HTMLElement;
    column.classList.remove('drag-over');
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const column = event.currentTarget as HTMLElement;
    column.classList.remove('drag-over');

    const draggedData = event.dataTransfer?.getData('text/plain');
    if (draggedData) {
      const [sourceColumnId, draggedIndex] = draggedData.split(':');
      const cardIndex = parseInt(draggedIndex, 10);

      // Obter o card arrastado (com título e descrição)
      const draggedCard = this.cards[cardIndex];

      // Remover o card da coluna de origem
      this.cards.splice(cardIndex, 1);

      // Adicionar o card à coluna de destino
      this.cards.push(draggedCard); // Agora o card será adicionado com título e descrição

      // Emitir o evento para notificar o movimento
      this.cardMoved.emit({ card: draggedCard, targetColumnId: this.columnId });
    }
  }
}

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
  @Input() columnId!: string;
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
    this.cards.push(card);
    this.closeModal();
  }

  removeCard(index: number) {
    this.cards.splice(index, 1);
  }

  onDragStart(event: DragEvent, index: number) {
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
      const [draggedIndex] = draggedData.split(':');
      const cardIndex = parseInt(draggedIndex, 10);
      const draggedCard = this.cards[cardIndex];

      this.cards.splice(cardIndex, 1);

      this.cards.push(draggedCard);

      this.cardMoved.emit({ card: draggedCard, targetColumnId: this.columnId });
    }
  }
}

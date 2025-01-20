import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
})
export class CardComponent {
  @Input() title!: string;
  @Input() description!: string;

  @Output() cardRemoved = new EventEmitter<void>();
  @Output() dragStarted = new EventEmitter<DragEvent>();
  @Output() dragEnded = new EventEmitter<DragEvent>();

  removeCard() {
    this.cardRemoved.emit();
  }

  onDragStart(event: DragEvent) {
    this.dragStarted.emit(event);
  }

  onDragEnd(event: DragEvent) {
    this.dragEnded.emit(event);
  }
}

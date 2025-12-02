import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [],
  templateUrl: './cards.html',
  styleUrl: './cards.css',
})
export class Cards {
  @Input({ required: true }) card!: any;
  @Output() editCardModalOpen = new EventEmitter<any>();
  @Output() removeCardModalOpen = new EventEmitter<any>();

  onEditCardModalOpen() { this.editCardModalOpen.emit(this.card); }
  onRemoveCardModalOpen() { this.removeCardModalOpen.emit(this.card); }
}

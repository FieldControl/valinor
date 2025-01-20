import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
  standalone: true,
  imports: [FormsModule],
})
export class ModalComponent {
  @Input() title: string = 'Adicionar Novo Card';
  @Output() cardAdded = new EventEmitter<{
    title: string;
    description: string;
  }>();
  @Output() close = new EventEmitter<void>();

  cardTitle: string = '';
  cardDescription: string = '';

  addCard() {
    if (this.cardTitle && this.cardDescription) {
      this.cardAdded.emit({
        title: this.cardTitle,
        description: this.cardDescription,
      });
      this.cardTitle = '';
      this.cardDescription = '';
      this.closeModal();
    }
  }

  closeModal() {
    this.close.emit();
  }
}

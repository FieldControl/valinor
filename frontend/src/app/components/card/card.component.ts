import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  isModalOpen: boolean = false;

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveChanges() {
    console.log('Nome:', this.title);
    console.log('Descrição:', this.description);
    this.closeModal();
  }

  deleteCard() {
    if (confirm('Tem certeza que deseja excluir este card?')) {
      console.log('Card excluído:', this.title);
      this.closeModal();
    }
  }
}

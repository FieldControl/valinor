import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
  imports: [CommonModule, FormsModule]
})
export class CardComponent {
  @Input() items: string[] = []; 
  @Input() columnId: number = 0;
  newItem = { name: '' };

  addItem(): void {
    const trimmedName = this.newItem.name.trim();

    if (!trimmedName) {
      console.error('O campo de texto está vazio ou inválido.');
      return;
    }

    // Verifique se items é um array antes de usar push
    if (!Array.isArray(this.items)) {
      console.error('items não é um array. Inicializando como um array vazio.');
      this.items = [];
    }

    // Atualiza os itens localmente
    this.items.push(trimmedName);

    // Limpa o campo de entrada
    this.newItem.name = '';
  }

  deleteItem(index: number): void {
    this.items.splice(index, 1);
  }
}


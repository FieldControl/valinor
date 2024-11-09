import { Component, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Card {
  id: number;
  title: string;
  description: string;
  columnId: number;
}

interface Column {
  id: number;
  title: string;
  cards: Card[];
}

@Component({
  selector: 'app-column',
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.css']
})
export class ColumnComponent {
  @Input() column!: Column;

  newCardTitle: string = '';
  newCardDescription: string = '';

  constructor(private http: HttpClient) {}

  addCard(): void {
    if (this.newCardTitle.trim() && this.newCardDescription.trim()) {
      const newCard = {
        title: this.newCardTitle,
        description: this.newCardDescription,
        columnId: this.column.id
      };

      this.http.post<Card>('http://localhost:3000/cards', newCard).subscribe(
        (createdCard) => {
          this.column.cards.push(createdCard);
          this.newCardTitle = '';
          this.newCardDescription = '';
        },
        (error) => {
          console.error('Erro ao criar o card:', error);
        }
      );
    } else {
      console.log('Título e descrição do card são obrigatórios.');
    }
  }
}

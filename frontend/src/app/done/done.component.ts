import { Component, OnInit } from '@angular/core';
import { CardService } from '../services/list.service';
import { Card } from '../services/list.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-done',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './done.component.html',
  styleUrl: './done.component.scss'
})
export class DoneComponent implements OnInit {
  column = { name: 'done', cards: [] as Card[] };

  constructor(private cardService: CardService, private http: HttpClient) {}

  remover(_id: string) {
    this.cardService.remover(_id).subscribe({
      next: () => {
        this.column.cards = this.column.cards.filter(card => card._id !== _id);
        console.log('Card excluído com sucesso!');
      },
      error: (err) => console.error('Erro ao excluir card:', err)
    });
  }

  mudarStatus(card: Card) {
    this.cardService.atualizar(card._id!, card).subscribe({
      next: () => {
        console.log('Status atualizado com sucesso!');
        location.reload();
      },
      error: (err) => {
        console.error('Erro ao atualizar o status:', err);
      }
    });
  }


  ngOnInit(): void {
    this.cardService.listarPorStatus('complete').subscribe({
      next: (data: Card[]) => {
        this.column.cards = data;
      },
      error: (error) => {
        console.error('Erro ao buscar os cards', error);
      }
    });
  }
}

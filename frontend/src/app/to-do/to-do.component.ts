import { Component, Input, OnInit } from '@angular/core';
import { CardService } from '../services/list.service';
import {Card} from '../services/list.service'
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './to-do.component.html',
  styleUrl: './to-do.component.scss'
})
export class TodoComponent implements OnInit {

  @Input() cards: any[] = [];

  constructor(private cardService: CardService,private http: HttpClient) {}

  remover(_id: string) {
    this.cardService.remover(_id).subscribe({
      next: () => {
        this.cards = this.cards.filter(card => card._id !== _id);
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
    this.cardService.listarPorStatus('to-do').subscribe(
      (data: Card[]) => {
        this.cards = data;
      },
      (error) => {
        console.error('Erro ao buscar os cards', error);
      }
    );
  }



}

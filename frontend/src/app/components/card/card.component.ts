import { Component, OnInit } from '@angular/core';
import { CardService } from '../../services/card.service';
import { Card } from '../../interfaces/card.interface';
import {CdkDrag} from '@angular/cdk/drag-drop';
import { ColunasComponent } from "../colunas/colunas.component";

@Component({
    selector: 'app-card',
    standalone: true,
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
    imports: [CdkDrag, ColunasComponent]
})
export class CardComponent implements OnInit {

  cards: Card[] = [];

  constructor(private cardService: CardService) {}

  ngOnInit(): void {
    this.getCards();
  }

  getCards(): void {
    this.cardService.getCards().subscribe({
      next: (cards) => {
        this.cards = cards;
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  /*
        Criar, Atualizar e deletar cards.
   
  addCard(card: Card): void {
    this.cardService.createCard(card).subscribe({
      next: (newCard) => {
        this.cards.push(newCard);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  updateCard(card: Card): void {
    this.cardService.updateCard(card.id, card).subscribe({
      next: (updatedCard) => {
        const index = this.cards.findIndex(c => c.id === card.id);
        if (index > -1) {
          this.cards[index] = updatedCard;
        }
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  deleteCard(id: number): void {
    this.cardService.deleteCard(id).subscribe({
      next: () => {
        this.cards = this.cards.filter(c => c.id !== id);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }
  */
}

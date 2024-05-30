import { Component, Input, input } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { CardsService } from './cards.service';
import { Card } from './cards.model';
import { OpenCardComponent } from './open-card/open-card.component';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [NzCardModule, CommonModule],
  templateUrl: './cards.component.html',
  styleUrl: './cards.component.scss'
})
export class CardsComponent {
  @Input() card !: Card;
  cards: Card[] = [];
  


  
//abrir pop up para editar o card
  constructor(public dialog: MatDialog) { }

  openForm(cardId: number): void {
      
    const dialogRef = this.dialog.open(OpenCardComponent, {
      width: '250px',
      data: { cardId: cardId , 
      color: this.card.color, 
      title: this.card.title, 
      description: this.card.description,
      cardColumn: this.card.cardColumn
    } 
      
    });
   
  }
  


}

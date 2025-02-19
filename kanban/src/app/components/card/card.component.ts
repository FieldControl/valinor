import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CardService } from '../../services/card.service';
import { Card } from '../../models/Card.interface';
import { CommonModule } from '@angular/common';
import { catchError, map, Observable, of} from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Column } from '../../models/Column.interface';
import { ColumnService } from '../../services/column.service';
import { ColumnComponent } from '../column/column.component';

@Component({
  selector: 'app-card',
  imports: [CommonModule, FormsModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
})

export class CardComponent {
  @ViewChild(ColumnComponent) columnComponent!: ColumnComponent;

  @Input() Column$ = new Observable<Column[]>();
  @Input() columnId!: number
  @Output() updateColumns = new EventEmitter<void>();

  newCard!: Card
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
   
  cards$ = new Observable<Card[]>();

  constructor(private cardService: CardService, private columnService: ColumnService) {
    this.getCards();
  }

  createCard(data: Card){
    this.cardService.addCard(data).pipe(
      catchError(error => {
        alert(error.error.message);
        return of(null)
      })
    ).subscribe(() => {
      this.getCards();
    }); 
  }

  saveEditCard() {
    this.cardService.updateCard(this.newCard.id!, {
      columnId: parseInt(this.newCard.columnId.toString()),
      title: this.newCard.title,
      description: this.newCard.description,
      id: this.newCard.id,
      position: this.newCard.position
    }).subscribe(() => {
      // this.getCards(); 
      this.updateColumns.emit();
    });
  }

  getCards(){
    this.cards$ = this.cardService.getCards().pipe(
      map((cards) => cards.filter((card) => card.columnId === this.columnId))
    );
    console.log(this.cards$);
  }

  editCard(card: Card){
    this.newCard = {
      id: card.id,
      title: card.title,
      description: card.description,
      columnId: card.columnId,
      position: card.position
    }
    
    this.OpenModal();
    this.isEditMode = true;
  }

  deleteCard(id: number){
    if(confirm("Tem certeza que deseja excluir o Card ?")){
      this.cardService.deleteCard(id).pipe(
        catchError(error => {
          alert(error.error.message);
          return of(null)
        })
      ).subscribe(() => {
        this.getCards();
      });    
    }
  }

  OpenModal(){
    this.isModalOpen = true;
  }

  closeModal(){
    this.isModalOpen = false;
  }

  saveCard(){
    this.closeModal();
    this.saveEditCard();
  }
}

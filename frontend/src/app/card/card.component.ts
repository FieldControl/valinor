import { Component, Input, OnInit } from '@angular/core';
import { KanbanService } from '../kanban.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  @Input() columnId: number = 0;
  cards: any[] = [];
  cardTitle: string = '';
  cardDescription: string = '';

  constructor(private kanbanService: KanbanService) {}

  ngOnInit(): void {
    this.loadCards();
  }

  loadCards() {
    if (this.columnId) {
      this.kanbanService.getCardsByColumn(this.columnId).subscribe(cards => {
        this.cards = cards;
      });
    }
  }
  createCard() {
    if (this.cardTitle.trim() && this.cardDescription.trim()) {
      this.kanbanService.createCard(this.cardTitle, this.cardDescription, this.columnId).subscribe(() => {
        this.loadCards(); 
        this.cardTitle = ''; 
        this.cardDescription = ''; 
      });
    }
  }
}

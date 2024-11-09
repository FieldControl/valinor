import { Component, Input, OnInit } from '@angular/core';
import { CardService } from '../../services/card.service';
import { WebsocketService } from '../../services/websocket.service';
import { Card } from '../../models/card.model';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  @Input() card!: Card;
  isEditing: boolean = false;
  editableTitle: string = '';
  editableDescription: string = '';

  constructor(
    private cardService: CardService,
    private websocketService: WebsocketService
  ) {}

  ngOnInit(): void {
    this.editableTitle = this.card.title;
    this.editableDescription = this.card.description;
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.saveChanges();
    }
  }

  saveChanges(): void {
    if (this.editableTitle.trim() && this.editableDescription.trim()) {
      const updatedCard: Partial<Card> = {
        title: this.editableTitle,
        description: this.editableDescription
      };

      this.cardService.updateCard(this.card.id, updatedCard).subscribe((updated) => {
        this.card.title = updated.title;
        this.card.description = updated.description;
        this.websocketService.editCard({
          id: this.card.id,
          title: updated.title,
          description: updated.description
        });
      });
    }
  }

  deleteCard(): void {
    this.cardService.deleteCard(this.card.id).subscribe(() => {
      this.websocketService.deleteCard(this.card.id);
    });
  }
}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Card } from '../../models/card.model';
import { CardService } from '../../services/card.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
})
export class CardComponent {

  constructor(private cardService: CardService) {}

  @Input() card!: Card;
  @Output() cardDeleted = new EventEmitter<number>();
  @Output() dragStart = new EventEmitter<{ event: DragEvent; card: Card }>();

  isEditing = false;
  editedTitle = '';
  editedDescription = '';

  toggleEditMode() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.editedTitle = this.card.title;
      this.editedDescription = this.card.description || '';
    }
  }


  saveCardChanges() {
    this.card.title = this.editedTitle;
    this.card.description = this.editedDescription;
    this.cardService.updateCard(this.card.id,{
      title: this.editedTitle,
      description:this.editedDescription
    }).subscribe({
      next: updateCard=>{
        this.card = updateCard;
      },
      error:err=>{
        console.error('Erro ao atualizar card',err);
      }
    });
    this.toggleEditMode();
  }

  onDragStart(event: DragEvent) {
    this.dragStart.emit({ event, card: this.card });
  }

  onDeleteCard() {
    this.cardDeleted.emit(this.card.id);
  }
}

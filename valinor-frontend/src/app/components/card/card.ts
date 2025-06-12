import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CardModel } from '../../models/card.model';
import { CardEditForm } from '../card-edit-form/card-edit-form';
import { ColumnModel } from '../../models/column.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-card',
  imports: [CommonModule, CardEditForm, FormsModule],
  standalone:true,
  templateUrl: './card.html',
  styleUrl: './card.scss'
})

export class Card {
  @Input() card!: CardModel
  @Input() columns: ColumnModel[] = []
  @Output() onEdit = new EventEmitter<{cardId: string, content: string}>() 
  @Output() onMove = new EventEmitter<{cardId: string, newColumnId: string}>()
  @Output() onDelete = new EventEmitter<string>()

  isEditFormOpen: boolean = false;
  isDeleteModalOpen: boolean = false;
  isMoveFormOpen: boolean = false;
  selectedColumnId: string = ''

  openEditForm(): void {
      this.isEditFormOpen = true;
  }

  openMoveForm() {
    this.selectedColumnId = this.card.column.id
    this.isMoveFormOpen = true
  }

  openDeleteModal():void {
    this.isDeleteModalOpen = true;
  }

  confirmDelete(): void {
    this.onDelete.emit(this.card.id);
    this.isDeleteModalOpen = false;
  }

  cancelDelete(): void {
    this.isDeleteModalOpen = false;
  }

  editCard(event: {content: string}){
    this.onEdit.emit({
      cardId: this.card.id,
      content: event.content
    })
    this.isEditFormOpen = false
  }

  moveCard(newColumnId: string){
    if(newColumnId && newColumnId !== this.card.column.id) {
      this.onMove.emit({
        cardId: this.card.id,
        newColumnId
      })
    }
    this.isMoveFormOpen = false;
  }
}

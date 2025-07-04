import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CardModel } from '../../models/kanban.model';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-card.html',
  styleUrl: './edit-card.css'
})
export class EditCard implements OnInit{
  @Input() cardModel!: CardModel;

  editedTitle: string = '';
  editedDescription: string = '';

  @Output() cardUpdated = new EventEmitter<CardModel>();
  @Output() cardDeleted = new EventEmitter<string>();
  @Output() formClosed = new EventEmitter<void>();

  
  ngOnInit(): void {
    if (this.cardModel){
      this.editedTitle = this.cardModel.title;
      this.editedDescription = this.cardModel.description || '';
    } 
  }
      onSave(): void{
        if (this.cardModel.title != this.editedTitle || this.cardModel.description != this.editedDescription){
          const updatedCard: CardModel = {
            ...this.cardModel,
            title: this.editedTitle,
            description: this.editedDescription
          };
          this.cardUpdated.emit(updatedCard);
        }
        this.formClosed.emit();
      }

      onDelete(): void{
        if(window.confirm('Are you sure?')){
          this.cardDeleted.emit(this.cardModel.id);
          this.formClosed.emit();
        }
      }
}

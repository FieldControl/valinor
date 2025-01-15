import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KanbanService } from '../kanban.service';

@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.component.html',
  imports: [CommonModule, FormsModule],
})
export class CardComponent implements OnInit {
  @Input() description: string = '';
  @Input() id: string = '';
  @Input() column: any;
  isCompleted: boolean = false;
  isEditing: boolean = false;
  editDescription: string = '';

  constructor(private kanbanService: KanbanService) {}

  ngOnInit(): void {
    if (this.id) {
      this.kanbanService.getCardById(this.id).subscribe((card: any) => {
        this.isCompleted = card.isCompleted;
      });
    }
  }

  toggleCompletion(): void {
    this.isCompleted = !this.isCompleted;
    this.kanbanService.deleteCard(this.id).subscribe(
      () => {
        this.column.cards = this.column.cards.filter((card: any) => card.id !== this.id);
      },
      (error) => {
        console.error('Erro ao excluir o card:', error);
        this.isCompleted = !this.isCompleted;
      }
    );
  }

  startEditing(): void {
    this.isEditing = true;
    this.editDescription = this.description;
  }

  saveDescription(): void {
    if (this.editDescription.trim()) {
      this.kanbanService.updateCardDescription(this.id, this.editDescription).subscribe(
        () => {
          this.description = this.editDescription;
          this.isEditing = false;
        },
        (error: any) => {
          console.error('Erro ao atualizar a descrição do card:', error);
        }
      );
    }
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.editDescription = this.description;
  }
}
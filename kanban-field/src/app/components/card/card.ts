import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Card } from '../../interfaces/kanban.interface';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { KanbanService } from '../../services/kanban.service';

@Component({
  selector: 'app-card',
  imports: [
    FormsModule,
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './card.html',
  styleUrls: ['./card.scss'],
})
export class CardComponent {
  @Input() card!: Card;
  @Output() deleteCard = new EventEmitter<string>();
  @Output() editCard = new EventEmitter<{ id: string; text: string; title: string }>();

  

  public isEditing = false;
  public editText = '';
  public editTitle = '';

  public constructor(private kanbanService: KanbanService) {}

  public startEdit() {
    this.isEditing = true;
    this.editText = this.card.text;
    this.editTitle = this.card.title;
  }

  public saveEdit() {
    const changes =
      this.editTitle.trim() !== this.card.title || this.editText.trim() !== this.card.text;

    const valid = this.editTitle.trim() && this.editText.trim();

    const titleLengthValid = this.editTitle.trim().length <= 15 && this.editTitle.trim().length > 0;
    const textLengthValid = this.editText.trim().length <= 300 && this.editText.trim().length > 0;

    if (!titleLengthValid) {
      this.kanbanService.createWarningToast(
        'O título deve ter no máximo 15 caracteres e no mínimo 1.',
      );
      return;
    }
    if (!textLengthValid) {
      this.kanbanService.createWarningToast(
        'O texto deve ter no máximo 300 caracteres e no mínimo 1.',
      );
      return;
    }

    if (changes && valid) {
      this.editCard.emit({
        id: this.card.id,
        text: this.editText.trim(),
        title: this.editTitle.trim(),
      });
    }
    this.isEditing = false;
  }

  public cancelEdit() {
    this.isEditing = false;
  }

  public onDelete() {
    this.deleteCard.emit(this.card.id);
  }

  public onDragStart(event: DragEvent) {
    event.dataTransfer!.effectAllowed = 'move';
    event.dataTransfer!.setData('cardId', this.card.id);
  }
}

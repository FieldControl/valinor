import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Column } from '../../interfaces/kanban.interface';
import { CardComponent } from '../card/card';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { KanbanService } from '../../services/kanban.service';

@Component({
  selector: 'app-column',
  imports: [
    FormsModule,
    CardComponent,
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './column.html',
  styleUrls: ['./column.scss'],
})
export class ColumnComponent {
  @Input() column!: Column;
  @Output() cardAdded = new EventEmitter<{ columnId: string; cardText: string; title: string }>();
  @Output() cardDropped = new EventEmitter<{ columnId: string; cardId: string }>();
  @Output() cardDeleted = new EventEmitter<{ columnId: string; cardId: string }>();
  @Output() cardEdited = new EventEmitter<{
    columnId: string;
    cardId: string;
    cardText: string;
    title: string;
  }>();
  @Output() columnDeleted = new EventEmitter<{ columnId: string }>();

  isAddingCard = false;
  newCardText = '';
  newCardTitle = '';
  isDragOver = false;

  public constructor(private kanbanService: KanbanService) {}

  public startAddingCard() {
    this.isAddingCard = true;
  }

  public addCard() {
    if (this.newCardTitle.length <= 0 || this.newCardTitle.length > 15) {
      this.kanbanService.createWarningToast(
        'O título deve ter no máximo 15 caracteres e no mínimo 1.',
      );
      return;
    }
    if (this.newCardText.length <= 0 || this.newCardText.length > 300) {
      this.kanbanService.createWarningToast(
        'O texto deve ter no máximo 300 caracteres e no mínimo 1.',
      );
      return;
    }

    if (this.newCardText.trim() && this.newCardTitle.trim()) {
      this.cardAdded.emit({
        columnId: this.column.id,
        cardText: this.newCardText.trim(),
        title: this.newCardTitle.trim(),
      });
      this.newCardText = '';
      this.newCardTitle = '';
      this.isAddingCard = false;
    }
  }

  public cancelAddCard() {
    this.isAddingCard = false;
  }

  public deleteCard(cardId: string) {
    this.cardDeleted.emit({ columnId: this.column.id, cardId });
  }

  public editCard(event: { id: string; text: string; title: string }) {
    this.cardEdited.emit({
      columnId: this.column.id,
      cardId: event.id,
      cardText: event.text,
      title: event.title,
    });
  }

  public onDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
    this.isDragOver = true;
  }

  public onDragLeave(event: DragEvent) {
    this.isDragOver = false;
  }
  public onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    const cardId = event.dataTransfer!.getData('cardId');
    this.cardDropped.emit({ columnId: this.column.id, cardId });
  }

  public deleteColumn() {
    this.columnDeleted.emit({ columnId: this.column.id });
  }
}

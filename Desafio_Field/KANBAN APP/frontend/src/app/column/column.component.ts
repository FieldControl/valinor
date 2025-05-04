// frontend/src/app/column/column.component.ts
import { Component, Input } from '@angular/core';
import { Column } from './column.model';
import { KanbanService } from '../kanban-service/kanban.service';

@Component({
  selector: 'app-column',
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.css']
})
export class ColumnComponent {
  @Input() column: Column;
  newCardContent: string = '';

  constructor(private kanbanService: KanbanService) {}

  addCard(): void {
    if (this.newCardContent) {
      this.kanbanService.createCard(this.newCardContent, this.column.id).subscribe(card => {
        this.column.cards.push(card);
        this.newCardContent = ''; // Reset input field
      });
    }
  }
}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { KanbanList } from '../model';

@Component({
  selector: 'ako-kanban-list',
  templateUrl: './kanban-list.component.html',
  styleUrls: ['./kanban-list.component.scss'],
})
export class KanbanListComponent {
  @Input() list!: KanbanList;
  @Output() readonly addTask = new EventEmitter<void>();
  @Output() readonly titleChanged = new EventEmitter<string>();
  @Output() readonly remove = new EventEmitter<void>();

  constructor() {}

  titleUpdate(newTitle: string): void {
    if (newTitle !== this.list.title) {
      this.titleChanged.emit(newTitle);
    }
  }
}

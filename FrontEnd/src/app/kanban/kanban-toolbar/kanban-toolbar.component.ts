import { Component } from '@angular/core';

@Component({
  selector: 'ako-kanban-toolbar',
  templateUrl: './kanban-toolbar.component.html',
  styleUrls: ['./kanban-toolbar.component.scss'],
})
export class KanbanToolbarComponent {
  get canUndo(): boolean {
    return false;
  }
  get canRedo(): boolean {
    return false;
  }

  constructor() {}

  undo(): void {}
  redo(): void {}
}

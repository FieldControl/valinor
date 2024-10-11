import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ako-kanban-drag-handle',
  template: `<img
    src="assets/icons/drag_indicator_rounded.svg"
    alt="drag"
    role="button"
  />`,
  styles: [
    `
      img {
        position: relative;
        cursor: move;
        top: 4px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanDragHandleComponent {
  constructor() {}
}

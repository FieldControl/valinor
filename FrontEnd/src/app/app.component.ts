import { Component } from '@angular/core';

@Component({
  selector: 'ako-root',
  template: `<ako-kanban-board></ako-kanban-board>`,
  styles: [
    `
      :host {
        width: 100vw;
      }
    `,
  ],
})
export class AppComponent {}

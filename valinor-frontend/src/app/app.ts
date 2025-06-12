import { Component } from '@angular/core';
import { Board } from './components/board/board';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Board],
  template: `<app-board></app-board>`,
})
export class AppComponent {
  title = 'Valinor';
}

import { Component, signal } from '@angular/core';
import { Board } from './components/board/board';

@Component({
  selector: 'app-root',
  imports: [Board],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  protected readonly title = signal('Kanban Field');
}

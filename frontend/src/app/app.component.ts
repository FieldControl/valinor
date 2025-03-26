import { Component } from '@angular/core';
import { KanbanComponent } from './kanban/kanban.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [KanbanComponent],
})
export class AppComponent {

  title = 'Meu App Kanban';
}

import { Component } from '@angular/core';
import { KanbanComponent } from './components/kanban/kanban.component';

@Component({
  selector: 'app-root',
  imports: [KanbanComponent], //KanbanComponent importado diretamente
  templateUrl: './app.component.html',
  standalone: true,
})
export class AppComponent {}

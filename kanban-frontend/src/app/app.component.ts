import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KanbanService } from '../app/services/kanban.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private kanbanService: KanbanService) {}
}

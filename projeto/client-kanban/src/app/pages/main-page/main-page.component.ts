import { Component } from '@angular/core';
import { KanbanBoardComponent } from '../../kanban-board/kanban-board.component';

@Component({
  selector: 'app-main-page',
  imports: [KanbanBoardComponent],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent { }
import { Component, OnInit } from '@angular/core';
import { KanbanService } from './services/kanban.service';
import { Column } from './models/column.model';
import { Card } from './models/card.model';

@Component({
  selector: 'kanban',
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.css']
})
export class KanbanComponent implements OnInit {

  columns: Column[] = [];
  cards: Card[] = [];

  constructor(private kanbanService: KanbanService) {}

  ngOnInit() {
    this.columns = this.kanbanService.getColumns();
    this.cards = this.kanbanService.getCards();
  }

  // ...

}
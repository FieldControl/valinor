import { Component, OnInit } from '@angular/core';
import { KanbanService } from '../../services/kanban.service';

interface Card {
  id: number;
  title: string;
  description: string;
}

interface Column {
  id: number;
  title: string;
  cards: Card[];
}

@Component({
  selector: 'app-kanban-board',
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.css'],
})
export class KanbanBoardComponent implements OnInit {
  columns: Column[] = [];

  constructor(private kanbanService: KanbanService) {}

  ngOnInit(): void {
    this.loadColumns();
  }

  loadColumns() {
    this.kanbanService.getColumns().subscribe((data) => {
      this.columns = data;
    });
  }

  addColumn(title: string) {
    if (!title.trim()) return;
    this.kanbanService.addColumn(title).subscribe(() => {
      this.loadColumns();
    });
  }

  deleteColumn(id: number) {
    this.kanbanService.deleteColumn(id).subscribe(() => {
      this.loadColumns();
    });
  }

  addCard(columnId: number, title: string, description: string) {
    if (!title.trim() || !description.trim()) return;
    this.kanbanService.addCard(columnId, title, description).subscribe(() => {
      this.loadColumns();
    });
  }

  deleteCard(cardId: number) {
    this.kanbanService.deleteCard(cardId).subscribe(() => {
      this.loadColumns();
    });
  }

  updateCard(cardId: number, newTitle: string | null, newDescription: string | null) {
    if (!newTitle || !newDescription) return;
    this.kanbanService.updateCard(cardId, newTitle, newDescription).subscribe(() => {
      this.loadColumns();
    });
  }
}

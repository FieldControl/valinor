import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KanbanService } from '../kanban.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  columns: any[] = [];

  constructor(private kanbanService: KanbanService) {}

  ngOnInit() {
    this.kanbanService.getColumns().subscribe((data) => {
      this.columns = data;
    });
  }
}

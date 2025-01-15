import { Component, OnInit } from '@angular/core';
import { KanbanService } from './kanban.service';

@Component({
  selector: 'app-kanban',
  standalone: true, // 
  imports: [],
  templateUrl: './kanban.component.html',
  styleUrl: './kanban.component.css'
})
export class KanbanComponent implements OnInit {
  columns: any[] = [];
  columnTitle: string = '';
  cardTitle: string = ''; 
  
  constructor(private kanbanService: KanbanService) { }

  ngOnInit(): void {
    this.kanbanService.getBoard().subscribe((res) => {
      console.log(res);
    });
    }
}

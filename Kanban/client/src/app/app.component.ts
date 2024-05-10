import { Component, OnInit } from '@angular/core';
import { Column } from './column/column.interface';
import { Card } from './card/card.interface';
import { KanbanService } from './kanban.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  columns: Column[] = [];
  columnCardsMap: { [columnId: string]: Card[] } = {};

  constructor(private kanbanService: KanbanService) {}

  ngOnInit(): void {
    this.loadColumns();
  }

  loadColumns(): void {
    this.kanbanService.getAllColumns().subscribe(columns => {
      this.columns = columns;
      // Inicializa o Cards para cada coluna
      this.columns.forEach(column => {
        this.columnCardsMap[column._id] = [];
      });
      // Após carregar as colunas, carrega os cards de cada coluna
      this.loadCardsForEachColumn();
    }, error => {
      console.error('Erro ao carregar as colunas:', error);
    });
  }

  loadCardsForEachColumn(): void {
    this.columns.forEach(column => {
      this.kanbanService.getCardsInColumn(column._id).subscribe(cards => {
        // Atualiza o mapa de cards para a coluna atual
        this.columnCardsMap[column._id] = cards;
      }, error => {
        console.error(`Erro ao carregar os cards da coluna ${column._id}:`, error);
      });
    });
  }
}

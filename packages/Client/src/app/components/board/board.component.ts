import { Component, OnInit } from '@angular/core';
import { TopBarComponent } from "../top-bar/top-bar.component";
import { ColumnComponent } from "../column/column.component";
import { CommonModule } from '@angular/common';
import { BoardService, Column } from '../../../services/board.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  standalone: true,
  imports: [TopBarComponent, ColumnComponent, CommonModule, HttpClientModule],
  providers: [BoardService, HttpClient]

})
export class BoardComponent implements OnInit {
  columns: Column[] = [];

  i: number = 0

  constructor(private boardService: BoardService) { }

  ngOnInit() {
    this.loadColumns();
  }

  loadColumns() {
    this.boardService.getColumns().subscribe(data => {
      this.columns = data;
    });
  }

  addColumn() { //receber input
    console.log('addColumn')
  }

  removeColumn(index: number) {
    this.boardService.deleteColumn(this.columns[index].id).subscribe(data => {
      this.loadColumns();
    })
    console.log(`remove column: ${this.columns[index].name}`);
  }

  moveColumn(index: number, direcao: 'Left' | 'Right') { // 
    this.boardService.updateColumn(this.columns[index].id, this.columns[index].name, this.columns[index].order).subscribe(data => {
      this.loadColumns();
    })
    console.log(`move column ${this.columns[index].name} for ${direcao}`);
  }

  renameColumn(index: number) {//receber input
    console.log(`rename column: ${this.columns[index].name}`);
  }

  createCard(index: number) {//receber input
    console.log(`Criar card na column: ${this.columns[index].name}`);
  }

  removeCard(colIndex: number, cardIndex: number) {
    this.boardService.deleteCard(this.columns[colIndex].cards[cardIndex].id).subscribe(data => {
      this.loadColumns();
    })
    console.log(`remove card '${this.columns[colIndex].cards[cardIndex]}' of the column ${this.columns[colIndex].name}`);
  }

  moveCardLeft(cardIndex: number) {

  }

  moveCardRight(cardIndex: number) {

  }

  renameCard(colIndex: number, cardIndex: number) {//receber input
    console.log(`rename card '${this.columns[colIndex].cards[cardIndex]}'`);
  }
}


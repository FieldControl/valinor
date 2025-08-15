import { Component, OnInit } from '@angular/core';
import { TopBarComponent } from "../top-bar/top-bar.component";
import { ColumnComponent } from "../column/column.component";
import { CommonModule } from '@angular/common';
import { BoardService, Column } from '../../../services/board.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  standalone: true,
  imports: [TopBarComponent, ColumnComponent, CommonModule, HttpClientModule, FormsModule],
  providers: [BoardService, HttpClient]

})
export class BoardComponent implements OnInit {
  columns: Column[] = [];

  newColumnName: string = ''

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

  addColumn(columnName: string) {
    const newColumnOrder = this.columns.length + 1;
    this.boardService.createColumn(columnName, newColumnOrder).subscribe(data => {
      this.loadColumns()
    })
  }

  removeColumn(index: number) {
    this.boardService.deleteColumn(this.columns[index].id).subscribe(data => {
      this.loadColumns();
    })
    console.log(`remove column: ${this.columns[index].name}`);
  }

  moveColumn(index: number, direcao: 'Left' | 'Right') { // 
    const newOrder = direcao === 'Right' ? this.columns[index + 1].order : this.columns[index - 1].order;
    this.boardService.moveColumn(this.columns[index].id, newOrder).subscribe(data => {
      this.loadColumns();
    })
    console.log(`move column ${this.columns[index].name} for ${direcao}`);
  }

  renameColumn(index: number, name: string) {
    this.boardService.updateColumn(this.columns[index].id, name).subscribe(data => {
      this.loadColumns()
    })
    console.log(`rename column: ${this.columns[index].name}`);
  }

  createCard(index: number) {
    console.log(`Criar card na column: ${this.columns[index].name}`);
    this.boardService.createCard(this.columns[index].id, "Rascunho").subscribe(data => {
      this.loadColumns()
    })
  }

  removeCard(colIndex: number, cardIndex: number) {
    this.boardService.deleteCard(this.columns[colIndex].cards[cardIndex].id).subscribe(data => {
      this.loadColumns();
    })
    console.log(`remove card '${this.columns[colIndex].cards[cardIndex]}' of the column ${this.columns[colIndex].name}`);
  }

  moveCardLeft(colIndex: number, cardIndex: number) {
    console.log(colIndex, cardIndex)
    if (colIndex > 0) {
      const card = this.columns[colIndex].cards[cardIndex];
      console.log(card)

      this.boardService.updateCard(card.id, card.title, this.columns[colIndex - 1].id).subscribe(data => {
        this.loadColumns();
      });
    }
  }

  moveCardRight(colIndex: number, cardIndex: number) {
    console.log(colIndex, cardIndex)
    if (colIndex < this.columns.length - 1) {
      const card = this.columns[colIndex].cards[cardIndex];
      console.log(card)

      this.boardService.updateCard(card.id, card.title, this.columns[colIndex + 1].id).subscribe(data => {
        this.loadColumns();
      });
    }
  }

  renameCard(colIndex: number, event: { index: number, name: string }) {
    console.log(colIndex, event.index, event.name);
    const card = this.columns[colIndex].cards[event.index]
    this.boardService.updateCard(card.id, event.name, card.column_id).subscribe((data) => {
      this.loadColumns()
    })
  }
}


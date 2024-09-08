import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CardComponent } from '../card/card.component';
import { CardFormComponent } from '../cardForm/cardForm.component';
import { Card } from '../../cardInterface';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Column } from '../../columnInterface';
import { v4 as uuidv4 } from 'uuid';
import { ColumnsService } from '../../services/columns.service';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  imports: [
    CardComponent,
    CardFormComponent,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    DragDropModule
  ],
  standalone: true,
  selector: 'column',
  templateUrl: './column.component.html',
  styleUrl: './column.component.css',
})
export class ColumnComponent implements OnInit{
  constructor(public matDialog:MatDialog, private columnsService:ColumnsService ) {}
  @Input() column: Column = {id:'',order: 0 ,title:'', cards:[]};
  @Output() remove = new EventEmitter<Column>();
  columnCards:Card[] = [];

  ngOnInit() {
    this.columnCards = this.column.cards;
  }

  addCard(card:Card) {
    card = {id: uuidv4(), order: this.columnCards.length+1, title: card.title, description: card.description};
    this.columnCards.push(card);
    this.column.cards = this.columnCards;
    this.columnsService.update(this.column.id,this.column).subscribe((response) => {});
  }

  removeColumn(remove: Column) {
    this.remove.emit(remove);
  }

  removeCard(card: Card) {
    let index = this.columnCards.findIndex(e => e.id === card.id);
    if(index !== -1) this.columnCards.splice(index,1);
    this.column.cards = this.columnCards;
    this.columnsService.update(this.column.id,this.column).subscribe((response) => {})
  }

  openDialog():void{
    const dialogRef = this.matDialog.open(CardFormComponent, {});
    dialogRef.afterClosed().subscribe(result => {
      if(result)this.addCard(result);
    })
  }
}
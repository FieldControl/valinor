import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CardModel, ColumnModel } from '../../models/kanban.model';
import { Card } from "../card/card";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-column',
  imports: [Card, CommonModule],
  templateUrl: './column.html',
  styleUrl: './column.css'
})

export class Column{

  @Input() columnModel!: ColumnModel;
  @Output() createCardClicked = new EventEmitter<string>();
  @Output() editCardClicked = new EventEmitter<CardModel>();
  @Output() columnEditClicked = new EventEmitter<ColumnModel>(); 

  emitEvent(): void{
    if (this.columnModel && this.columnModel.id) {
          this.createCardClicked.emit(this.columnModel.id);
        } 
      }

  onCardClicked(card: CardModel): void {
    this.editCardClicked.emit(card);
  }

  onColumnEdit(): void { 
    this.columnEditClicked.emit(this.columnModel);
  }
}
  
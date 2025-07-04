import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ColumnModel } from '../../models/kanban.model';
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
  
  emitEvent(): void{
    if (this.columnModel && this.columnModel.id) {
          this.createCardClicked.emit(this.columnModel.id);
          console.log ("Event ",this.columnModel.id);
        } 
      }
}
  
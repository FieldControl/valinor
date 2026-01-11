import { Component, Input, Output, EventEmitter } from '@angular/core';

import {  
  CdkDrag,
  CdkDragDrop, 
  CdkDropList,
  CdkDragPlaceholder, 
  moveItemInArray, 
  transferArrayItem,
} from '@angular/cdk/drag-drop';

import { Cards } from '../cards/cards.js';

@Component({
  selector: 'app-columns',
  standalone: true,
  imports: [Cards, CdkDropList, CdkDrag, CdkDragPlaceholder],
  templateUrl: './columns.html',
  styleUrl: './columns.css',
})
export class Columns {
  @Input({ required: true }) column!: any;

  @Output() cardMoved = new EventEmitter<any>();

  @Output() editColumnModalOpen = new EventEmitter<any>();
  @Output() removeColumnModalOpen = new EventEmitter<any>();

  @Output() createCardModalOpen = new EventEmitter<any>();
  @Output() editCardModalOpen = new EventEmitter<any>();
  @Output() removeCardModalOpen = new EventEmitter<any>();

  //Função responsável de mover os cards entre colunas
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
    
    this.cardMoved.emit({
      cardId: event.item.data.id,
      newColumnId: event.container.id,
    })
  }
  
  onEditModalOpen() { this.editColumnModalOpen.emit(this.column); }
  onRemoveModalOpen() { this.removeColumnModalOpen.emit(this.column); }
}

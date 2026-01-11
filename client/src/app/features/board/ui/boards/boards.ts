import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-board-item',
  imports: [],
  templateUrl: './boards.html',
  styleUrl: './boards.css',
})
export class Boards {
  @Input({ required: true }) board!: any;

  @Output() editBoardModalOpen = new EventEmitter<any>();
  @Output() removeBoardModalOpen = new EventEmitter<any>();

  onEditBoardModalOpen() { this.editBoardModalOpen.emit(this.board); }
  onRemoveBoardModalOpen() { this.removeBoardModalOpen.emit(this.board); }
}

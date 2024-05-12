
import { Component } from '@angular/core';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

import { HttpClient, HttpHandler} from '@angular/common/http';

import { board } from '../../models/board.model';
import { column } from '../../models/column.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-main-view',
  standalone: true,
  imports: [CdkDrag, CdkDropList, CommonModule, CdkDropListGroup, FormsModule],
  templateUrl: './main-view.component.html',
  styleUrl: './main-view.component.css'
})

export class MainViewComponent {




  AddAndRemove: string = '';
  ind: any;
  cdkDropListDropped: any;

  
  
 

  board: board = new board('board', [new column('', [])
    , new column('', []),
  new column('', []),
  new column('', [])]);


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
  }


  add(AddAndRemove: string, index: any) {
    for (let i = 0; i < this.board.columns.length; i++) {
      if (this.board.columns[index] == this.board.columns[i]) {
        this.board.columns[i].task.push(this.AddAndRemove);
      }
    }

  }
  TituloTab(AddAndRemove: string, index: any) {
    for (let i = 0; i < this.board.columns.length; i++) {
      if (this.board.columns[index] == this.board.columns[i]) {
        this.board.columns[i].name = this.AddAndRemove;
      }
    }
  }

  remove(AddAndRemove: string, index: any) {
    for (let i = 0; i < this.board.columns.length; i++) {
      if (this.board.columns[index] == this.board.columns[i]) {
        for (let n = 0; n < this.board.columns[i].task.length; n++) {
          this.board.columns[i].task.splice(n, 1);
        }
      }

    }
  }

}


import { Component } from '@angular/core';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { NavBarComponent } from '../../components/navBar/navBar.component';
import { CardComponent } from '../../components/card/card.component';
import { NgFor } from '@angular/common';
import { Card } from '../../interfaces/card';

@Component({
  selector: 'app-main',
  standalone: true,
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
  imports: [
    NavBarComponent,
    CardComponent,
    NgFor,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag
  ]
})

export class MainComponent {
  cards: { [column: string]: Card[] } = {
    todo: [],
    doing: [],
    done: [],
  };

  generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }

  addTask(column: 'todo' | 'doing' | 'done'): void {
    const newCard: Card = { id: this.generateId(), title: 'Novo Título', description: 'Nova Descrição' };
    this.cards[column].push(newCard);
  }

  getCards(column: 'todo' | 'doing' | 'done'): Card[] {
    return this.cards[column];
  }

  drop(event: CdkDragDrop<Card[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }
}

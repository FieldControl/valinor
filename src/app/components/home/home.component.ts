import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ColunaComponent } from '../coluna/coluna.component';
import { NavBarraComponent } from '../navbarra/navBar.component';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { Card } from '../../services/cardService';


@Component({
  selector: 'app-home',
  imports: [CommonModule, ColunaComponent, NavBarraComponent, CdkDropList],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  cardsEmAberto: Card[] = [
    { "titulo": "123", "descricao": "456", "id": 1 },

  ];
  cardsRefinamento: Card[] = [
    { "titulo": "refinando", "descricao": "refinamento", "id": 2 },

  ];
  cardsExecucao: Card[] = [
    { "titulo": "refinando", "descricao": "refinamento", "id": 3 },

  ];
  cardsConcluido: Card[] = [
    { "titulo": "refinando", "descricao": "refinamento", "id": 4 },

  ]

  drop(event: CdkDragDrop<Card[]>) {
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
}


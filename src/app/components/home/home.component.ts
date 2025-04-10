import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ColunaComponent } from '../coluna/coluna.component';
import { NavBarraComponent } from '../navbarra/navBar.component';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { Card, CardService } from '../../services/cardService';


@Component({
  selector: 'app-home',
  imports: [CommonModule, ColunaComponent, NavBarraComponent, CdkDropList],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  cardsEmAberto: Card[] = [];
  cardsRefinamento: Card[] = [];
  cardsExecucao: Card[] = [];
  cardsConcluido: Card[] = [];
  ehPrimeiraColuna: boolean = false

  constructor(private cardService: CardService) {
  }

  ngOnInit(): void {
    this.cardService.cardsAdicionados$.subscribe(novoCard =>
      this.cardsEmAberto.push(novoCard));
  }

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


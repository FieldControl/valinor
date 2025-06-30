import { Component, Input } from '@angular/core';
import { CardModel } from '../../models/kanban.model';

@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './card.html',
  styleUrl: './card.css'
})
export class Card {
  @Input() cardModel!: CardModel;

constructor() {}

}

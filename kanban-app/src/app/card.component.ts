import { Component, Input } from '@angular/core';
import { Card } from './models/card.model';

@Component({
  selector: 'card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent {

  @Input()
    card!: Card;

  // ...

}
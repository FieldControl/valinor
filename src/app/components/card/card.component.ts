import { Component, Input, ViewChild } from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { Card } from '../../interfaces/card';

@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent {
  @Input() card!: Card;
  @ViewChild(CdkDrag) drag!: CdkDrag;

  constructor() {
    this.drag = {} as CdkDrag;
  }
}

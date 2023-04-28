import { Component, Input } from '@angular/core';

export type IValidSizes = 'tiny' | 'small' | 'medium' | 'large' | 'x-large';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
})
export class ItemComponent {
  @Input() value: any;
  @Input() label!: string;
  @Input() spacement!: boolean;
  @Input() isIcon: boolean = false;
  @Input() labelFontSize: IValidSizes = 'small';
  @Input() valueFontSize: IValidSizes = 'medium';
  @Input() type: string = 'standard';

  constructor() {}
}

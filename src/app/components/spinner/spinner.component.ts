import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
})
export class SpinnerComponent {
  private static nextId = 0;

  @Input() size = 3.2;
  @Input() label = '';

  public id = `spinner_${++SpinnerComponent.nextId}`;

  constructor() {}

  public getStyle() {
    return `height: ${this.size}rem; width: ${this.size}rem;`;
  }
}

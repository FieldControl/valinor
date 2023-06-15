import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-simple',
  templateUrl: './card.simple.component.html',
  styleUrls: ['./card.simple.component.scss']
})
export class CardSimpleComponent {
  @Input() title!: string;
  @Input() subtitle!: string;
  @Input() content!: string;
  @Input() size: string = 'default'; // Valor padrão
}

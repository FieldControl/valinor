import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-home-map',
  templateUrl: './card-home-map.component.html',
  styleUrls: ['./card-home-map.component.css']
})
export class CardHomeMapComponent {
  @Input() link?: string
  @Input() title?: string
  @Input() description?: string
}

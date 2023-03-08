import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-link',
  templateUrl: './card-link.component.html',
  styleUrls: ['./card-link.component.css']
})
export class CardLinkComponent {
  @Input() title?: string
  @Input() link?: string
  @Input() icon?: string

}


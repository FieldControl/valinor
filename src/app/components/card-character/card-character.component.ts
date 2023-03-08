import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-character',
  templateUrl: './card-character.component.html',
  styleUrls: ['./card-character.component.css']
})
export class CardCharacterComponent {
  @Input() name?: string
  @Input() race?: string
  @Input() height?: string
  @Input() gender?: string
  @Input() birth?: string
  @Input() spouse?: string
  @Input() death?: string
  @Input() realm?: string
  @Input() hair?: string
  @Input() wikiUrl?: string


}

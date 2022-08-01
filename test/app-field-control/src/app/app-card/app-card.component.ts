import { Component, Input } from '@angular/core';
import { Character } from 'src/model/Character';

@Component({
  selector: 'app-card',
  templateUrl: './app-card.component.html',
  styleUrls: ['./app-card.component.css']
})
export class AppCardComponent {

  @Input()
 public character: Character = {
  id: 0,
  name: '',
  description: '',
  stories: 0,
  image: ''
 };

}

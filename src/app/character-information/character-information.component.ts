import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-character-information',
  templateUrl: './character-information.component.html',
  styleUrls: ['./character-information.component.css']
})
export class CharacterInformationComponent {
  @Input() role: any;

  @Input() ability1: any;
  @Input() ability1Image: any;
  @Input() ability1Description: any;

  @Input() ability2: any;
  @Input() ability2Image: any;
  @Input() ability2Description: any;

  @Input() ability3: any;
  @Input() ability3Image: any;
  @Input() ability3Description: any;

  @Input() ability4: any;
  @Input() ability4Image: any;
  @Input() ability4Description: any;

  constructor() {
    
  }
}

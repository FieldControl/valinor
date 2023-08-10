import { Component, Input } from '@angular/core';
import LanguageColors from '../../../assets/language-colors.json';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.sass'],
})
export class CardComponent {
  @Input() data: any;

  getLanguageColor(language: any) {
    var colors = LanguageColors.filter(x => x.nome == language);

    if(colors.length == 0){
      return 'gray';
    }

    let colorFiltered = colors[0];
    return colorFiltered.color;
  }
}

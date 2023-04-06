import { Component } from '@angular/core';

@Component({
  selector: 'app-result-filter-component',
  templateUrl: './result-filter-component.component.html',
  styleUrls: ['./result-filter-component.component.css']
})
export class ResultFilterComponentComponent {
  buttonsOfMvButtonToggle = [
    {value: 'characters', text: 'Personagens'},
    {value: 'events', text: 'Eventos'},
    {value: 'series', text: 'Séries'},
    {value: 'comics', text: 'Comics'},
    {value: 'creators', text: 'Criadores'},
  ];  
}

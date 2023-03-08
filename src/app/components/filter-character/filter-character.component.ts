import { Component, EventEmitter, Output } from '@angular/core';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-filter-character',
  templateUrl: './filter-character.component.html',
  styleUrls: ['./filter-character.component.css']
})
export class FilterCharacterComponent {
  faSearch = faSearch;
  name?: string
  race?: string

  @Output() filter = new EventEmitter<any>()

  filterCharacter = () => {
    this.filter.emit({
      name: this.name,
      race: this.race,
    })
  }

}

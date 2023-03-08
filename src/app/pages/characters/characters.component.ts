import { Component } from '@angular/core';
import { CharacterServiceService } from 'src/app/services/character-service.service';

@Component({
  selector: 'app-characters',
  templateUrl: './characters.component.html',
  styleUrls: ['./characters.component.css'],
})
export class CharactersComponent {
  characters: any;
  currentPage: number = 1;
  totalPages?: number;

  constructor(private characterService: CharacterServiceService) { }

  ngOnInit() {
    this.getCharacters(this.currentPage);
  }

  getCharacters = (page: number, name?: string, race?: string) => {
      this.characterService.getCharacters(page, name, race).subscribe((response) => {
      this.characters = response.docs;
      this.totalPages = response.pages;
    });
  };

  handleCurrentPage = (page: number) => {
    this.currentPage = page;
    this.getCharacters(page);
  };

  handleFilter = (filter?: any) => {
    this.getCharacters(this.currentPage, filter.name, filter.race);
  };
}

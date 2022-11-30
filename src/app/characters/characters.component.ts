import { CharacterApiService } from './character/shared/character-api.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Character } from './character/character.component'

@Component({
  selector: 'app-characters',
  templateUrl: './characters.component.html',
  styleUrls: ['./characters.component.css']
})

export class CharactersComponent implements OnInit {
  title = 'FieldMarvel'
  allCharacters: any[] = []
  @Input() query: string = ''
  @Output() charactersEvent = new EventEmitter<any[]>()
  @Input() characters: any[] = []

  constructor(private characterService: CharacterApiService) {}

  ngOnInit() {
    this.characterService.getAllCharacters().subscribe(
      characters => characters.forEach((char: any)=> {
        this.allCharacters.push(char)
      })
    )

    this.setCharacters(this.allCharacters)
  }

  setCharacters(characters: any[]) {
    this.charactersEvent.emit(characters)
  }
}
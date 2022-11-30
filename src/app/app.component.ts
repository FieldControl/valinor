import { Component, Input, Output } from '@angular/core';
import { single } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'fieldMarvel';
  allCharacters: any[] = []
  characters: any[] = []
  
  setCharacters(chars: any[]) {
    setTimeout(() => {
      chars.forEach(char => {
        this.allCharacters.push(char)
        this.characters.push(char)
      })
    }, 1000)
  }

  setCharactersByQuery(query: string) {
    if (query === '') {
      this.characters.splice(0)
      this.allCharacters.forEach((char: any) => {
        this.characters.push(char)
      })
    }

    this.characters = this.characters.filter(char => char.name.toLowerCase().includes(query.toLowerCase()))
  }
}
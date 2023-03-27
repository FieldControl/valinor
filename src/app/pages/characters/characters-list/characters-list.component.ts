import { CharacterComponent } from './../character/character.component';
import { CharacterCardComponent } from './../components/character-card/character-card.component';
import { Character } from './../../../models/character.model';
import { distinctUntilChanged, Observable, tap } from 'rxjs';
import { CharactersService } from './../../services/characters.service';
import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-characters-list',
  templateUrl: './characters-list.component.html',
  styleUrls: ['./characters-list.component.scss']
})
export class CharactersListComponent implements OnInit {

  search = new FormControl()
  characters$!: Observable<Character[]>
  totalCharacters!: number
  pageSize = 20;
  currentPage = 0;

  constructor(
    private charactersService: CharactersService,
    private dialog: MatDialog
    ) {

  }

  ngOnInit(): void {
    this.getCharacters()
    this.setTotalCharacters()

  }

  setTotalCharacters() {
    this.charactersService.getTotalCharacters().subscribe(
      data => this.totalCharacters = data
    )
  }

  getCharacters() {
    this.characters$ = this.charactersService.getCharacters(0)
  }

  onPageChange(event: PageEvent) {
    const searchValue = this.search.value
    this.currentPage = event.pageIndex;

    if (this.search.value) {
      this.characters$ = this.charactersService.getCharacterByName(searchValue, this.currentPage * this.pageSize)
    } else {
      this.characters$ = this.charactersService.getCharacters(this.currentPage * this.pageSize);

    }
  }

  searchCharacter() {
    const value = this.search.value

    if (value) {
      this.characters$ = this.charactersService.getCharacterByName(value, 0)

    } else {
      this.getCharacters()
    }
  }

  openCharacterDialog(character: Character ) {
    const dialogRef = this.dialog.open(CharacterComponent, {
      // width: '40%',
      panelClass: "dialog-responsive",
      data: character
    });
  }
}

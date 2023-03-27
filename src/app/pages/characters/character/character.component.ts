import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Character } from 'src/app/models/character.model';

@Component({
  selector: 'app-character',
  templateUrl: './character.component.html',
  styleUrls: ['./character.component.scss']
})
export class CharacterComponent implements OnInit {
  comics: string[] = []

  constructor(public dialogRef: MatDialogRef<CharacterComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Character) { }

    ngOnInit(): void {
      const firstThreeComics = this.data.comics.items.slice(0,3)
        firstThreeComics.map(
          item => this.comics.push(item.name)
        )
    }

    get comicsUrl(): string {
      const url = this.data.urls.filter(
        item => item.type == 'comiclink'
      )
      return url[0].url
    }
}


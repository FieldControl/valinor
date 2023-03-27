import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharactersListComponent } from './characters-list/characters-list.component';
import { CharacterComponent } from './character/character.component';
import { CharacterCardComponent } from './components/character-card/character-card.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';



@NgModule({
  declarations: [
    CharactersListComponent,
    CharacterComponent,
    CharacterCardComponent
  ],
  imports: [
    CommonModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    MatDialogModule

  ],
  exports: [
    CharacterCardComponent
  ]
})
export class CharactersModule { }

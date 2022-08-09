import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PokeHeaderComponent } from './poke-header/poke-header.component';
import { PokeSearchBarComponent } from './poke-search-bar/poke-search-bar.component';

@NgModule({
  declarations: [
    PokeHeaderComponent,
    PokeSearchBarComponent
  ],
  exports: [
    PokeHeaderComponent,
    PokeSearchBarComponent
  ],
  imports: [
    CommonModule
  ]
})
export class SharedModule { }

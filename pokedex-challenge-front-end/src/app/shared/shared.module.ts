import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RoutingModule } from '../pages/routing.module';

import { PokeHeaderComponent } from './poke-header/poke-header.component';
import { PokeSearchBarComponent } from './poke-search-bar/poke-search-bar.component';
import { PokeListComponent } from './poke-list/poke-list.component';

@NgModule({
  declarations: [
    PokeHeaderComponent,
    PokeSearchBarComponent,
    PokeListComponent
  ],
  exports: [
    PokeHeaderComponent,
    PokeSearchBarComponent,
    PokeListComponent,
  ],
  imports: [
    CommonModule,
    RoutingModule
  ]
})
export class SharedModule { }

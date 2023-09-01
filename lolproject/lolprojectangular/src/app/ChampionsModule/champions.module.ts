import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChampionsComponent } from './Components/champions/champions.component';
import { ChampionsRoutingModule } from './Routing/champions-routing.module';
import { ChampionsFreeComponent } from './Components/champions-free/champions-free.component';

@NgModule({
  declarations: [
    ChampionsComponent,
     ChampionsFreeComponent
    ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    ChampionsRoutingModule,

  ],
  exports: [ChampionsComponent,
    ChampionsFreeComponent],
})
export class ChampionModule {}

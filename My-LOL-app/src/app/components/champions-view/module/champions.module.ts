import { ChampionsViewComponent } from './../champions-view.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';

import { ChampionsRoutingModule } from './champions-routing.module';


@NgModule({
  declarations: [
    ChampionsViewComponent
  ],
  imports: [
    CommonModule,
    ChampionsRoutingModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatIconModule,
    MatListModule,
    MatIconModule
  ]
})
export class ChampionsModule { }

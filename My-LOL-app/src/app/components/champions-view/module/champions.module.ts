import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChampionsViewComponent } from './../champions-view.component';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { ChampionsRoutingModule } from './champions-routing.module';
import { PaginatorModule } from '../../shared/paginator/module/paginator.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ChampionsViewComponent
  ],
  imports: [
    CommonModule,
    ChampionsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatTooltipModule,
    MatIconModule,
    MatListModule,
    MatIconModule,
    PaginatorModule
  ]
})
export class ChampionsModule { }

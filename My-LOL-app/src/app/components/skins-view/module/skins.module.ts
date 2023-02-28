import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SkinsRoutingModule } from './skins-routing.module';
import { SkinsViewComponent } from '../skins-view.component';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [
    SkinsViewComponent,

  ],
  imports: [
    CommonModule,
    SkinsRoutingModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatIconModule,
    MatListModule,
    MatIconModule
  ]
})
export class SkinsModule { }

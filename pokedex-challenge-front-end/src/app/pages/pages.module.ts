import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RoutingModule } from './routing.module';

import { HomeComponent } from './home/home.component';
import { DetailsComponent } from './details/details.component';

@NgModule({
  declarations: [
    HomeComponent,
    DetailsComponent
  ],
  imports: [
    CommonModule,
    RoutingModule
  ]
})
export class PagesModule { }

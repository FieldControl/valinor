import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

//My Modules Routing
import {RoutingModule} from "./routing.module";
import {SharedModule} from "../shared/shared.module";

//My Components Pages
import { HomeComponent } from './home/home.component';
import { DetailsComponent } from './details/details.component';



@NgModule({
  declarations: [
    HomeComponent,
    DetailsComponent
  ],
  imports: [
    CommonModule,
    RoutingModule,
    SharedModule,

  ]
})
export class PagesModule { }

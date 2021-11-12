import { NgModule } from '@angular/core';
import {CommonModule} from "@angular/common";
import { ReactiveFormsModule } from '@angular/forms';

import { SearchRoutingModule } from './search-routing.module';
import { SearchComponent } from './search.component';

import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  imports: [
   SearchRoutingModule,
   ReactiveFormsModule,
   CommonModule,
   NgxPaginationModule
  ],
  declarations: [SearchComponent]
})
export class SearchModule { }
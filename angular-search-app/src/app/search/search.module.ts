import { NgModule } from '@angular/core';
import {CommonModule} from "@angular/common";


import { SearchComponent } from './search.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  imports: [
   ReactiveFormsModule,
   CommonModule,
   NgxPaginationModule
  ],
  declarations: [SearchComponent]
})
export class SearchModule { }
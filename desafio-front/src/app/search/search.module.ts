import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NgStackFormsModule } from '@ng-stack/forms';

import { SharedModule } from '../shared/shared.module';
import { SearchAdvancedComponent } from './search-advanced/search-advanced.component';
import { SearchRoutingModule } from './search-routing.module';
import { SearchComponent } from './search.component';


@NgModule({
  declarations: [
    SearchComponent,
    SearchAdvancedComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgStackFormsModule,
    RouterModule,
    SearchRoutingModule,
    SharedModule,
  ],
})
export class SearchModule { }

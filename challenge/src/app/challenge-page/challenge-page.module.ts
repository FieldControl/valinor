import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from "@angular/forms";
import { SearchListComponent } from './search-list/search-list.component';

@NgModule({
  declarations: [
    SearchListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      {
        path: 'search-list', component: SearchListComponent
      }
    ])
  ]
})
export class ChallengePageModule { }

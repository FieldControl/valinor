import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardIssueComponent } from './card-issue.component';
import { MatIconModule } from '@angular/material/icon';
import { MaterialModule } from '../material/material.module';

@NgModule({
  declarations: [CardIssueComponent],
  exports: [CardIssueComponent],
  imports: [MatIconModule, MaterialModule, CommonModule,],
})
export class CardIssueModule {}

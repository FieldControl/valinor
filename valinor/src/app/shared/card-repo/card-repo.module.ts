import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardRepoComponent } from './card-repo.component';

import { MatIconModule } from '@angular/material/icon';
import { MaterialModule } from '../material/material.module';

@NgModule({
  declarations: [CardRepoComponent],
  exports: [CardRepoComponent],
  imports: [CommonModule, MatIconModule, MaterialModule],
})
export class CardRepoModule {}

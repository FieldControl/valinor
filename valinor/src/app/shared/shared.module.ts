import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';


/*Module do Material */

import { MaterialModule } from './material/material.module';

/*Componentes Compartilháveis */
import { SearchBarComponent } from './search-bar/search-bar.component';
import { CardRepoModule } from './card-repo/card-repo.module';
import { CardIssueModule } from './card-issue/card-issue.module';
import { ShortNumberPipe } from './short-number.pipe';

@NgModule({
  declarations: [SearchBarComponent, ShortNumberPipe],
  exports: [
    MaterialModule,
    SearchBarComponent,

    CardRepoModule,
    CardIssueModule,
    ShortNumberPipe
  ],
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, FormsModule],
})
export class SharedModule {}

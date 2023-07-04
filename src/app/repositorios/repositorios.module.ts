import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { RepositoriosComponent } from './repositorios/repositorios.component';
import { RepositoriosRoutingModule } from './repositorios-routing.module';

@NgModule({
  declarations: [RepositoriosComponent],
  imports: [
    CommonModule,
    RepositoriosRoutingModule,
    SharedModule,
  ],
})
export class RepositorioModule {}

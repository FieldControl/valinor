import { NgModule } from '@angular/core';

import { LayoutsModule } from './layouts/layouts.module';
import { PipesModule } from './pipes/pipes.module';

@NgModule({
  exports: [LayoutsModule, PipesModule],
  imports: [LayoutsModule, PipesModule],
})
export class SharedModule {}

import { CommonModule } from '@angular/common';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { SingletonGuard } from '@core/guards/singleton.guard';

@NgModule({
  imports: [CommonModule],
})
export class CoreModule extends SingletonGuard {
  constructor(
    @Optional()
    @SkipSelf()
    parentModule: CoreModule
  ) {
    super(parentModule);
  }
}

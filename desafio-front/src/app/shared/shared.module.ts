import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { components } from './components';


@NgModule({
  declarations: [
    ...components,
  ],
  exports: [
    ...components,
  ],
  imports: [
    CommonModule,
  ],
})
export class SharedModule { }

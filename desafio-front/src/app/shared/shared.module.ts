import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import { components } from './components';


@NgModule({
  declarations: [
    ...components,
  ],
  exports: [
    ...components,
  ],
  imports: [
    BsDatepickerModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
  ],
})
export class SharedModule { }

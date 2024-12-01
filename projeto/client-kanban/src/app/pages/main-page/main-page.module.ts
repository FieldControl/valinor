import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainPageComponent } from './main-page.component';
import { DialogModule } from 'primeng/dialog';

@NgModule({
  declarations: [MainPageComponent],
  imports: [
    CommonModule,
    DialogModule,
  ],
  exports: [MainPageComponent],
})
export class MainPageModule { }
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    HeaderComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    HeaderComponent
  ]
})

export class SharedModule { }

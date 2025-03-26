import { NgModule } from '@angular/core';  
import { BrowserModule } from '@angular/platform-browser';  
import {CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app.routing.module'; 

@NgModule({
  declarations: [
  ],
  imports: [BrowserModule,
    AppRoutingModule,
    RouterModule,
    RouterModule.forRoot([]),
  ],
  exports: [RouterModule],
  providers: [],
  bootstrap: []  ,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

  
  
  })
export class AppModule { }

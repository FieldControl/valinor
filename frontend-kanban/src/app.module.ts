import {NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app/app.component';

@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, CommonModule],
    bootstrap: [AppComponent]
})
export class AppModule {}
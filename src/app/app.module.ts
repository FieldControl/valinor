import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HomeComponent } from './view/home/home.component';
import { ResultsModule } from './view/results/results.module';

@NgModule({
  declarations: [AppComponent, HomeComponent],
  imports: [BrowserModule, AppRoutingModule, ResultsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

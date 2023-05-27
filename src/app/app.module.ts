import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { SearchResultsComponent } from './search-results/search-results.component';
import { HttpClientModule } from '@angular/common/http';

import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AppComponent,
    SearchResultsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})




export class AppModule { }

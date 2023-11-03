import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HomeComponent } from './views/home/home.component';
import { SlideBarComponent } from './views/slide-bar/slide-bar.component';
import { CardRepositoryComponent } from './views/card-repository/card-repository.component';
import { PaginationComponent } from './views/pagination/pagination.component';

import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SlideBarComponent,
    CardRepositoryComponent,
    PaginationComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FormsModule } from '@angular/forms';
import { CreateColumnsComponent } from './components/columns/create-columns/create-columns.component';
import { ListColumnsComponent } from './components/columns/list-columns/list-columns.component';
import { ColumnComponent } from './components/columns/column/column.component';
import { CreateCardsComponent } from './components/cards/create-cards/create-cards.component';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    CreateColumnsComponent,
    ListColumnsComponent,
    ColumnComponent,
    CreateCardsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

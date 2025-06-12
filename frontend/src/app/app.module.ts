// src/app/app.module.ts

import { NgModule }           from '@angular/core';
import { BrowserModule }      from '@angular/platform-browser';
import { FormsModule }        from '@angular/forms';
import { HttpClientModule }   from '@angular/common/http';

import { AppRoutingModule }   from './app-routing.module';

import { AppComponent }       from './app.component';
import { LoginComponent }     from './features/login/login.component';
import { BoardComponent }     from './features/board/board.component';
import { ColumnComponent }    from './features/board/column.component';
import { CardComponent }      from './features/board/card.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,

    // standalone components
    AppComponent,
    LoginComponent,
    BoardComponent,
    ColumnComponent,
    CardComponent,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

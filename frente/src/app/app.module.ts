import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { routes } from './app.routes';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { ColumnComponent } from './components/column/column.component';
import { CardComponent } from './components/card/card.component';

@NgModule({
  declarations:
    [],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    ColumnComponent,
    CardComponent,
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap:[]
})
export class AppModule { }

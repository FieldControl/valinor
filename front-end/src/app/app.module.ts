import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { KanbanComponent } from './component/kanban/kanban.component';
import { ShortDatePipe } from './component/kanban/short-date.pipe';
import { CardComponent } from './component/card/card.component';
import { BadgeComponent } from './component/badge/badge.component';

@NgModule({
  declarations: [
    AppComponent,
    KanbanComponent,
    ShortDatePipe,
    CardComponent,
    BadgeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

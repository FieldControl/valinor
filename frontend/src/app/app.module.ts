import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { KanbanComponent } from './components/kanban/kanban.component';
import { ShortDatePipe } from './pipes/short-date.pipe';
import { CardComponent } from './components/card/card.component';
import { BadgeComponent } from './components/badge/badge.component';
import { UpdateCardComponent } from './components/update-card/update-card.component';
import { MatDialogModule } from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FilterPipe } from './pipes/filter.pipe';
@NgModule({
  declarations: [
    AppComponent,
    KanbanComponent,
    ShortDatePipe,
    CardComponent,
    BadgeComponent,
    UpdateCardComponent,
    FilterPipe
  ],
  entryComponents: [UpdateCardComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    MatDialogModule,
    MatCheckboxModule,
    HttpClientModule,
    DragDropModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { KanbanComponent } from './component/kanban/kanban.component';
import { ShortDatePipe } from './component/kanban/short-date.pipe';
import { CardComponent } from './component/card/card.component';
import { BadgeComponent } from './component/badge/badge.component';
import { UpdateCardComponent } from './component/card/update-card/update-card.component';
import { MatDialogModule } from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FilterPipe } from './component/kanban/filter.pipe';
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

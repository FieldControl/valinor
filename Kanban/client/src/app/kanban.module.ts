import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { ColumnComponent } from './column/column.component';
import { CardComponent } from './card/card.component';
import { KanbanService } from './kanban.service';

@NgModule({
  declarations: [
    AppComponent,
    ColumnComponent,
    CardComponent
  ],
  imports: [
    BrowserModule,
    DragDropModule,
    MatCardModule,
    MatIconModule,
    HttpClientModule
  ],
  providers: [KanbanService],
  bootstrap: [AppComponent]
})
export class KanbanModule { }
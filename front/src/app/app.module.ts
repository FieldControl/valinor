import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { AppComponent } from './app.component';
import { CardsService } from './cards.service';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MatDialogModule,
    DragDropModule,
    HttpClientModule
    
  ],
  providers: [CardsService],
  bootstrap: [AppComponent]
})
export class AppModule { }

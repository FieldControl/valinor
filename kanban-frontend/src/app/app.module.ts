import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ColumnComponent } from './Components/column/column.component';
import { TaskComponent } from './Components/task/task.component';
import { HomeComponent } from './Pages/home/home.component';
import { ModalComponent } from './Components/modal/modal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [
    AppComponent,
    ColumnComponent,
    TaskComponent,
    HomeComponent,
    ModalComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule, DragDropModule, FontAwesomeModule],
  providers: [provideHttpClient()],
  bootstrap: [AppComponent],
})
export class AppModule {}

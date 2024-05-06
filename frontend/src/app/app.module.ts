import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { KanbansModule } from './kanbans/kanbans.module';
import { KanbansComponent } from './kanbans/kanbans.component';
import { NavbarComponent } from './navbar/navbar.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { CreateKanbanComponent } from './create-kanban/create-kanban.component';
import { UpdateKanbanComponent } from './update-kanban/update-kanban.component';

@NgModule({
  declarations: [
    AppComponent,
    KanbansComponent,
    NavbarComponent,
    CreateKanbanComponent,
    UpdateKanbanComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    KanbansModule,
    FormsModule,
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

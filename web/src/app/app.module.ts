import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
// angular material modules
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
// components
import { HeaderComponent } from './components/header/header.component';
import { NavigationMenuComponent } from './components/navigation-menu/navigation-menu.component';
import { TaskContainerComponent } from './components/task-container/task-container.component';
import { TaskCardComponent } from './components/task-card/task-card.component';
// pages
import { HomeComponent } from './pages/home/home.component';
import { ModalComponent } from './components/modal/modal.component';

@NgModule({
  declarations: [
    AppComponent,
    // components
    HeaderComponent,
    NavigationMenuComponent,
    TaskContainerComponent,
    TaskCardComponent,
    // pages
    HomeComponent,
    ModalComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
  ],
  providers: [provideAnimationsAsync()],
  bootstrap: [AppComponent],
})
export class AppModule {}

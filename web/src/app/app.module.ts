import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { NavigationMenuComponent } from './components/navigation-menu/navigation-menu.component';
import { TaskContainerComponent } from './components/task-container/task-container.component';
import { TaskCardComponent } from './components/task-card/task-card.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    NavigationMenuComponent,
    TaskContainerComponent,
    TaskCardComponent,
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

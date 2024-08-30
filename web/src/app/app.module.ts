import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatIconModule } from '@angular/material/icon';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { NavigationMenuComponent } from './components/navigation-menu/navigation-menu.component';

@NgModule({
  declarations: [AppComponent, HeaderComponent, NavigationMenuComponent],
  imports: [BrowserModule, AppRoutingModule, MatIconModule],
  providers: [provideAnimationsAsync()],
  bootstrap: [AppComponent],
})
export class AppModule {}

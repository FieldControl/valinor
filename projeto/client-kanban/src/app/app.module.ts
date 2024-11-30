import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { MainPageModule } from './pages/main-page/main-page.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, MainPageModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
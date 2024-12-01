import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { MainPageModule } from './pages/main-page/main-page.module';
import { DialogModule } from 'primeng/dialog';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, 
    MainPageModule,
    DialogModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
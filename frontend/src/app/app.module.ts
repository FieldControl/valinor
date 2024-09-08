import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, provideHttpClient } from '@angular/common/http'; 
import { AppComponent } from './app.component'; 
import { BoardComponent } from './ui/board/board.component';

@NgModule({
  declarations: [
    AppComponent, 
    BoardComponent,
  ],
  imports: [
    BrowserModule,
    HttpClient, 
  ],
  providers: [provideHttpClient(),],
  bootstrap: [AppComponent] 
})
export class AppModule { }
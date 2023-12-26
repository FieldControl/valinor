import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RepoComponent } from './components/repo/repo.component';
import { HttpClientModule } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from './components/header/header.component';
import { RepoCardComponent } from './components/repo-card/repo-card.component'
import { PaginationModule } from './components/pagination/pagination.module';

@NgModule({
  declarations: [
    AppComponent,
    RepoComponent,
    HeaderComponent,
    RepoCardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatIconModule,
    PaginationModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

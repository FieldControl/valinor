import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/pages/home/home.component';
import { RepoCardComponent } from './components/repo-card/repo-card.component';
import { ShortNumberPipe } from './pipes/short-number/short-number.pipe';
import { GithubDatePipe } from './pipes/github-date/github-date.pipe';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { MetaHeaderComponent } from './components/meta-header/meta-header.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RepoCardComponent,
    ShortNumberPipe,
    GithubDatePipe,
    ClickOutsideDirective,
    MetaHeaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HomeModule } from './pages/home/home.module';
import { HttpClientModule } from '@angular/common/http';

import { MatPaginatorModule } from '@angular/material/paginator';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { HomeComponent } from './pages/home/home.component';
import { HeroDetailsComponent } from './pages/hero-details/hero-details.component';
import { HeroDetailsModule } from './pages/hero-details/hero-details.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    MatPaginatorModule,
    BrowserAnimationsModule,
    HomeModule,
    HeroDetailsModule,
    RouterModule.forRoot([
      { path: 'heroes', component: HomeComponent },
      { path: 'heroes/:id', component: HeroDetailsComponent },
      { path: '', redirectTo: 'heroes', pathMatch: 'full' },
      { path: '**', redirectTo: 'heroes', pathMatch: 'full' }  
    ])
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';


import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Component, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { SearchComponentComponent } from './components/search-component/search-component.component';
import { RepositoriosComponentComponent } from './components/repositorios-component/repositorios-component.component';
import { PaginasComponentComponent } from './components/paginas-component/paginas-component.component';
import { MensagemErroComponentComponent } from './components/mensagem-erro-component/mensagem-erro-component.component';
import { BrowserModule } from '@angular/platform-browser';

describe('AppComponent', () => {


  beforeEach(() => TestBed.configureTestingModule({
    declarations: [
      AppComponent,
      SearchComponentComponent,
      RepositoriosComponentComponent,
      PaginasComponentComponent,
      MensagemErroComponentComponent
      
    ],
    imports: [
      BrowserModule,
      AppRoutingModule,
      FormsModule,
      HttpClientModule
    ],
    providers: []
  }).compileComponents());

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});

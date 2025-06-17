

import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Index } from './desafio-field/index';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

/* Removed @NgModule decorator as it is incompatible with standalone components */


@Component({
  selector: 'app-root',
  imports: [ Index,],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true
})

export class App implements OnInit{


constructor() {}
ngOnInit() { 
}


  todo = ['Get to work', 'Pick up groceries', 'Go home', 'Fall asleep'];
  done = ['Get up', 'Brush teeth', 'Take a shower', 'Check e-mail', 'Walk dog'];
  pendente = [ 'bababoi'];
  pipipopo = ['nadadadadada'];
  joao = ['hoje'];


  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }
}

// src/app/app.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Kanban } from './components/kanban/kanban';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    Kanban 
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css'] 
})
export class AppComponent {
  title = 'kanban-frontend-field';
}
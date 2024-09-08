// kanban-board.component.ts
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { BoardComponent } from './ui/board/board.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HttpClient, provideHttpClient } from '@angular/common/http'; 

@Component({
  imports: [
    MatCardModule,
    BoardComponent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
  ],
  providers: [HttpClient ],
  standalone: true,
  selector: 'app-component',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  
}
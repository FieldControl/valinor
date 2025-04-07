import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BoardComponent } from './board/board.component'; // importa o componente

@Component({
  selector: 'app-root',
  standalone: true, // standalone obrigatório
  imports: [RouterOutlet, BoardComponent], // importa o componente
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'kanban-frontend';
}
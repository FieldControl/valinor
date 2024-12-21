import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { KanbanComponent } from './pages/kanban/kanban.component';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HomeComponent, KanbanComponent],
  standalone: true,
  providers: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  
})
export class AppComponent {
  title = 'frontkanban';
}

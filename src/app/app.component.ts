import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
import { TaskComponent } from './components/task/task.component';
import { BoardsComponent } from './components/boards/boards.component'; 
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TaskComponent, BoardsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'kanban-field';
}
